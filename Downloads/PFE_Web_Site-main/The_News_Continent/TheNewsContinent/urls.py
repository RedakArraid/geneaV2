from django.urls import path,include
from . import views 

from .views import chatbot_view,generate_audio
urlpatterns = [
    # Modifier les chemins de sorte à définir article_page comme page d'accueil et supprimer l'autre chemin
    #path('',views.home, name='home'),
    path('',views.Home_page, name='lecture_cmp'),
    path('article/<int:article_id>/', views.article_detail, name='article_detail'),
    path('chatbot/', chatbot_view, name='chatbot'),
    path('generate-audio/', generate_audio, name='generate_audio'),
]
