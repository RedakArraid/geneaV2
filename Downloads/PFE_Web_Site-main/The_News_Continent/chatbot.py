import BmpLib_Ai as bmp

text = """
        Accoudé à un bureau marqué du sceau présidentiel au cœur d’une salle bouillonnante remplie de supporteurs galvanisés, 
        puis dans le bureau Ovale, Donald Trump a savamment mis en scène ses premiers paraphes devant les caméras du monde entier, 
        lundi 20 janvier, au premier jour de son investiture. Réduction drastique de l’immigration, remise en cause du droit du sol et 
        des droits des personnes transgenres, retrait de l’Organisation mondiale de la santé ou encore de l’accord de Paris sur le 
        climat… Le 47e président des Etats-Unis a signé une avalanche de décrets marquant une rupture brutale avec l’administration Biden.
        De nombreux juristes et acteurs de la société civile américaine estiment toutefois que plusieurs de ses décisions sortent de la 
        légalité ou seront inapplicables. Les démocrates dénoncent également des mesures menaçant les droits des minorités et l’Etat de 
        droit. Cela entraîne, dès le lendemain du retour de Donald Trump au pouvoir, la relance de la bataille judiciaire, qui avait marqué 
        son premier mandat.
"""

media_id = "bmp_media1"

# Appel de la fonction
bmp_object = bmp.get_BMP_Article_Object(text, media_id)

# Résultats
#extractiveSummary, abstractiveSummary = bmp_object.get_summaries()
#print("Résumé extractif :", extractiveSummary)
#print("Résumé abstractif :", abstractiveSummary)


#qiz = input(" Question : ")
#response = bmp_object.chat_with_question(qiz)
print('Réponse: ', bmp_object.content)