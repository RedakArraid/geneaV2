import numpy as np
import BmpLib_Ai as bmp
from newsapi import NewsApiClient


import requests, re, json
#from lxml import html
from bs4 import BeautifulSoup

from datetime import datetime
import pandas as pd
#import schedule
import time

#import bbc_feeds
from typing import Dict


newsapi = NewsApiClient(api_key='2413dc081c1b41b3935dbe978fa76c62')
#newsapi.get_top_headlines(sources='bbc-news')
page_size = 1000
from_param = '2025-01-25'
to = '2025-01-31'
q = 'ukraine war'

data_en = newsapi.get_everything(
    sources='bbc-news,the-verge,abc-news,bbc-news,bbc-sport,business-insider,cbs-news,financial-post,fortune,fox-sports,medical-news-today,national-geographic,new-scientist,politico,polygon,talksport,techcrunch,the-huffington-post,the-sport-bible,the-washington-post,the-wall-street-journal',
    #sort_by='relevancy', #sources='bbc-news',
    from_param=from_param, to=to,
    language='en', #page=1, page_size=page_size,   
)

data_fr = newsapi.get_everything(
    sources='le-monde,lequipe,les-echos,liberation',
    #sort_by='relevancy', #sources='bbc-news',
    from_param=from_param, to=to,
    language='fr', #page=1, page_size=page_size,   
)
article_en = [{**a, 'language': 'en'} for a in data_en['articles']]
article_fr = [{**a, 'language': 'fr'} for a in data_fr['articles']]



#len(article_en), len(article_fr)
#print(article_fr)

data = article_fr + article_en 
articles = data.copy()

for article in articles:
    date = datetime.strptime(article['publishedAt'], '%Y-%m-%dT%H:%M:%SZ').date()
    article['date'] = date
    
    # Extract source name
    article['source'] = article['source']['name']
    
    # Remove unnecessary fields
    article.pop('author', None)
    article.pop('publishedAt', None)


def get_content(url: str) -> str:
    # Send a request to the website
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")
        return '', ''
        
    # Parse the page content
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all <article> tags
    try:
        article = soup.find_all('article')
        if len(article) > 100000000: #0
            article = soup.find_all('article')[0]
            text = article.get_text(strip=True)
            if len(text.split("\"")) == 1:
                content = text
            else:
                content = " ".join(text.split("\"")[:-1])
        else:
            article = soup.find_all('p')
            content = " ".join(p.get_text(strip=True) for p in article)

    except Exception as e:
        return '', 'No content usable'
            
    return content, ''

df = pd.DataFrame(articles)

# Function to check if URL likely points to an article based on keywords in URL or title
def is_article(url, title):
    video_keywords = ["video", "watch", "stream", "youtube", "vimeo", 'sound']
    return not any(keyword in url.lower() or keyword in title.lower() for keyword in video_keywords)

# Apply the function to each row
df['is_article'] = df.apply(lambda row: is_article(row['url'], row['title']), axis=1)

# Use requests.head() to verify 'Content-Type' as a secondary check
def is_article_by_content_type(url):
    try:
        response = requests.head(url, timeout=5)
        return response.headers.get("Content-Type", "").startswith("text/html")
    except requests.RequestException:
        return False

# Apply the function to each row in the DataFrame and store the result in a new column
df['is_article_by_content_type'] = df['url'].apply(is_article_by_content_type)

df = df[(df['is_article'] == True) & (df['is_article_by_content_type'] == True)]
df = df.reset_index(drop=True)

for i, url in enumerate(df['url']):
    #print(i, url)
    content, msg = get_content(url)
    #print(len(content), msg)
    #print()
    
    df.loc[i, 'content'] = content
    df.loc[i, 'getContentMsg'] = msg
    #print(len(content))

dfs = df[df['content']!=''].copy()

liste_de_dicts = dfs.to_dict(orient='records')

texte_lMd = dfs[dfs['source']=='Le Monde'].copy()
dfs2 = dfs[dfs['source']!='Le Monde'].copy()

texte_lMd['content'] = texte_lMd['content'].str[2085:]

FInal_df = pd.concat([dfs2,texte_lMd])
FInal_df_art = FInal_df[['source', 'title', 'description', 'url', 'urlToImage', 'content','language']].copy()

french_art = FInal_df_art[FInal_df_art["language"]=="fr"].copy()


All_Articles = french_art.to_dict(orient='records')
for ticle in All_Articles:
    ticle.pop('source', None) 
    ticle.pop('_id', None)

part1 = All_Articles[:20].copy()
part2 = All_Articles[20:40].copy()
part3 = All_Articles[:60].copy()

media_id = "bmp_media1"

for ticle in part3:
    bmp_object = bmp.get_BMP_Article_Object(ticle['content'], media_id)
    # Résultats
    extractiveSummary, abstractiveSummary = bmp_object.get_summaries()
    ticle['Extractive_sum'] = extractiveSummary
    ticle['Abstractive_sum'] = abstractiveSummary



data_actuality = []
data_actuality.extend(part3)

print(data_actuality)

import pickle

#Enregistrement

with open("data_actuality.pkl", "wb") as f:
    pickle.dump(data_actuality, f)

