from flask import Flask, request, jsonify
import BmpLib_Ai as bmp

app = Flask(__name__)

# Initialisation
media_id = "bmp_media1"
bmp_object = bmp.get_BMP_Article_Object("", media_id)  # Entraînement avec texte vide

@app.route('/ask', methods=['POST'])
def handle_request():
    global bmp_object, media_id
    data = request.json
    text = data.get('text')
    question = data.get('question')

    if not text or not question:
        return jsonify({'error': 'Texte et question sont requis.'}), 400

    # Vérifier si le texte est déjà entraîné
    if bmp_object.content != text:
        bmp_object = bmp.get_BMP_Article_Object(text, media_id)

    # Répondre à la question
    response = bmp_object.chat_with_question(question)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)

