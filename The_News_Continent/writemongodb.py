from pymongo import MongoClient
from datetime import date
import BmpLib_Ai as bmp
import pickle




with open("tableau.pkl", "rb") as f:
    data_actuality = pickle.load(f)


###
######## N'oublie pas de créer une base de données Mongo DB qui aura le nom de "The_News_Continent_DB"
##### Regarde également le port par défaut définit pour Mongo DB sur ton Mac
# Connexion à MongoDB
client = MongoClient('mongodb://localhost:27017/')
databases = client.list_database_names()
print("Bases de données :", databases)

# Créer une base de données et une collection
db = client["The_News_Continent_DB"]
collection = db["TheNewsContinent_article"]
print(collection)
# Ajouter un document
for rp in data_actuality:
    # Vérifiez si le document avec la même URL existe
    if not collection.find_one({"url": rp["url"]}):
        # Vérifiez les entiers trop grands avant l'insertion
        for key, value in rp.items():
            if isinstance(value, int) and value.bit_length() > 64:
                rp[key] = str(value)  # Convertir en chaîne de caractères
        collection.insert_one(rp)
    else:
        print(f"Document déjà existant pour l'URL : {rp['url']}")



