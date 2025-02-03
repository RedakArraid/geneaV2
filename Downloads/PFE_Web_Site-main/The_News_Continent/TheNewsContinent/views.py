from django.shortcuts import render
from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from pymongo import MongoClient

from django.views.decorators.csrf import csrf_exempt
import uuid
import random
import json
import requests

import io
from gtts import gTTS
from functools import lru_cache

import threading

# Connexion MongoDB
client = MongoClient('localhost', 27017)
db = client['The_News_Continent_DB']
collection = db['TheNewsContinent_article']

# Page d'accueil
def Home_page(request):
    cached_data = cache.get('home_page_data')
    
    if not cached_data:
        documents = collection.find()
        data_art = []
        for document in documents:
            document.pop('_id', None)
            document.pop('id', None)
            document['id'] = uuid.uuid4().int
            data_art.append(document)
        
        random.shuffle(data_art)
        cached_data = {'art_actu': data_art}
        cache.set('home_page_data', cached_data, timeout=3600)
    
    random.shuffle(cached_data['art_actu'])
    return render(request, 'home_page.html', {'article': cached_data['art_actu']})

# Détail d'un article
def article_detail(request, article_id):
    cached_data = cache.get('home_page_data')
    art = cached_data['art_actu'].copy()
    random.shuffle(art)
    article = next((a for a in cached_data['art_actu'] if a['id'] == int(article_id)), None)

    cache.set("article_id",article_id, timeout=3600)


    if not article:
        return render(request, '404.html', status=404)
    
    return render(request, 'article_detail.html', {'article': article, 'cached_data': art})


# Fonction pour interroger le serveur externe
def ask_server(text, question):
    url = 'http://localhost:8001/ask'
    payload = {'text': text, 'question': question}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return response.json().get('response')
        return f"Erreur {response.status_code} : {response.text}"
    except requests.exceptions.RequestException as e:
        return f"Erreur de connexion : {e}"


def chatbot_view(request):
    cached_data = cache.get('home_page_data')
    if not cached_data:
        return JsonResponse({'response': "Erreur : données en cache non disponibles."})

    article_id = cache.get("article_id")
    if not article_id:
        return JsonResponse({'response': "Erreur : aucun article sélectionné."})

    article = next((a for a in cached_data['art_actu'] if a['id'] == int(article_id)), None)
    if not article:
        return JsonResponse({'response': "Erreur : article introuvable."})

    conversation_history = cache.get('conversation_history', [])

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_input = data.get('message')
            if not user_input:
                return JsonResponse({'response': "Erreur : message vide."})
        except json.JSONDecodeError:
            return JsonResponse({'response': 'Erreur : données JSON invalides.'})

        conversation_history.append({'sender': 'user', 'message': user_input})
        cache.set('conversation_history', conversation_history)

        bot_response = ask_server(article['content'], user_input)

        conversation_history.append({'sender': 'bot', 'message': bot_response})
        cache.set('conversation_history', conversation_history)

        return JsonResponse({'response': bot_response, 'history': conversation_history})

    return JsonResponse({'response': 'Erreur : méthode non autorisée.'})


@lru_cache(maxsize=100)  # Cache les 100 derniers fichiers audio générés

@csrf_exempt
def generate_audio(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get('text', '')
        if text:
            tts = gTTS(text, lang='fr')
            audio_file = io.BytesIO()
            tts.write_to_fp(audio_file)
            audio_file.seek(0)
            
            return HttpResponse(audio_file, content_type='audio/mpeg')

    return JsonResponse({'error': 'Texte manquant ou requête invalide'}, status=400)