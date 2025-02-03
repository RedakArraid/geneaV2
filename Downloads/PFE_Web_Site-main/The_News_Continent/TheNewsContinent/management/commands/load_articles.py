from django.core.management.base import BaseCommand
from newsapi import NewsApiClient
from TheNewsContinent.models import Article
import uuid

class Command(BaseCommand):
    help = 'Charger les articles dans la base de données depuis NewsAPI'

    def handle(self, *args, **kwargs):
        # Initialise NewsAPI client
        newsapi = NewsApiClient(api_key='2413dc081c1b41b3935dbe978fa76c62')

        # Récupération des articles
        categories = ['technology', 'business', 'science', 'general', 'sports', 'entertainment', 'health']
        articles = []
        for category in categories:
            data = newsapi.get_top_headlines(category=category, language='en', country='us')
            articles.extend(data['articles'])
        for arr in articles:
            if isinstance(arr, dict):
                    for ticle in arr:
                        ticle['id'] = uuid.uuid4()
                        #print(ticle['id'])
                        ticle.pop('source', None)  # Utilisation de None pour éviter une erreur si la clé n'existe pas
        # Sauvegarder les articles dans la base de données
        Article.save_articles(articles)
        self.stdout.write(self.style.SUCCESS('Articles chargés avec succès dans la base de données.'))

