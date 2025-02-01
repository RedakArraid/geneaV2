import requests

def ask_server(text, question):
    url = 'http://localhost:8001/ask'
    payload = {
        'text': text,
        'question': question
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return response.json().get('response')
        else:
            return f"Erreur {response.status_code}: {response.text}"
    except requests.exceptions.RequestException as e:
        return f"Erreur de connexion: {e}"

"""f __name__ == '__main__':
    
    text = des fans rassemblés en communautés continuent de faire vivre la mémoire de cet opus si spécial. 
    QuandSarah (le prénom a été modifié) a découvertLife is Strange, elle n’avait que 19 ans. 
    Elle était encore étudiante, vivait dans le sud-est des Etats-Unis, où elle a grandi, et ne savait pas encore de quoi serait fait son avenir. 
    Près d’une décennie plus tard, la voilà désormais mariée, salariée dans le domaine de la conception architecturale et résidente au Canada. 
    En dépit de tous les bouleversements qui ont jalonné son existence, une seule chose est demeurée intacte chez elle : sa passion pour le jeu vidéo narratif du studio français Dontnod Entertainment, devenu Don’t Nod. 
    « Les Polaroïds, le fait de tenir un journal comme le personnage de Max… 
    Tout ce qui me passionne aujourd’hui m’est arrivé grâce àLife is Strange», confie celle qui a rencontré son épouse en ligne par le biais d’une communauté de fans du jeu, dont elle est aujourd’hui modératrice et qui rassemble,sur le site Reddit, plus de 150 000 internautes. 
    La passion presque obsessionnelle de Sarah rappelle en effet celle de nombreux autres adeptes deLife is Strange, sollicités parLe Mondeà l’occasion des dix ans de la sortie du jeu, jeudi 30 janvier. 
    Tous connaissent par cœur l’histoire fictive de Max Caufield, 18 ans, photographe amateur et étudiante à la Blackwell Academy. 
    Tous se souviennent surtout du moment où la protagoniste se découvre le pouvoir de remonter le temps, qui lui permettra d’enquêter sur des faits inquiétants et paranormaux. 
    Ce récit, maintes fois revisité (le cours de l’histoire deLife is Strangeévolue selon les choix des joueurs), ils continuent aujourd’hui de lui donner corps en ligne et dans leurs vies respectives. 
    Il vous reste 80.68% de cet article à lire. La suite est réservée aux abonnés. Lecture duMondeen cours sur un autre appareil. 
    Vous pouvez lireLe Mondesur un seul appareil à la fois Ce message s’affichera sur l’autre appareil. 
    Parce qu’une autre personne (ou vous) est en train de lireLe Mondeavec ce compte sur un autre appareil. 
    Vous ne pouvez lireLe Mondeque surun seul appareilà la fois (ordinateur, téléphone ou tablette). 
    Comment ne plus voir ce message ? En cliquant sur «Continuer à lire ici» et en vous assurant que vous êtes la seule personne à consulterLe Mondeavec ce compte. 
    Que se passera-t-il si vous continuez à lire ici ? Ce message s’affichera sur l’autre appareil. Ce dernier restera connecté avec ce compte. 
    Y a-t-il d’autres limites ? Non. Vous pouvez vous connecter avec votre compte sur autant d’appareils que vous le souhaitez, mais en les utilisant à des moments différents. 
    Vous ignorez qui est l’autre personne ? Nous vous conseillons demodifier votre mot de passe. 
    Lecture restreinte Votre abonnement n’autorise pas la lecture de cet article Pour plus d’informations, merci de contacter notre service commercial. 
    Envie de lire la suite ?Les articlesdu Mondeen intégralité à partir de 7,99 €/mois Envie de lire la suite ?
    Les articles en intégralitéà partir de 7,99 €/mois Newsletters du monde Applications Mobiles Abonnement Suivez Le Monde



    text =  Accoudé à un bureau marqué du sceau présidentiel au cœur d’une salle bouillonnante remplie de supporteurs galvanisés, 
        puis dans le bureau Ovale, Donald Trump a savamment mis en scène ses premiers paraphes devant les caméras du monde entier, 
        lundi 20 janvier, au premier jour de son investiture. Réduction drastique de l’immigration, remise en cause du droit du sol et 
        des droits des personnes transgenres, retrait de l’Organisation mondiale de la santé ou encore de l’accord de Paris sur le 
        climat… Le 47e président des Etats-Unis a signé une avalanche de décrets marquant une rupture brutale avec l’administration Biden.
        De nombreux juristes et acteurs de la société civile américaine estiment toutefois que plusieurs de ses décisions sortent de la 
        légalité ou seront inapplicables. Les démocrates dénoncent également des mesures menaçant les droits des minorités et l’Etat de 
        droit. Cela entraîne, dès le lendemain du retour de Donald Trump au pouvoir, la relance de la bataille judiciaire, qui avait marqué 
        son premier mandat.
    
    question = "quelles sont les informations importantes du texte ?"
    response = ask_server(text, question)
    print('Réponse:', response)"""