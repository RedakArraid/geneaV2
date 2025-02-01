from django.db import models
import uuid

class Article(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Champ UUIDField pour id
    author = models.CharField(max_length=255, blank=True)  # Auteur
    title = models.CharField(max_length=255)  # Titre de l'article
    description = models.TextField(blank=True)  # Description
    url = models.URLField(unique=True)  # URL unique
    url_to_image = models.URLField(blank=True, null=True)  # URL de l'image
    published_at = models.DateTimeField()  # Date de publication
    content = models.TextField(blank=True)  # Contenu

    def __str__(self):
        return self.title

    @classmethod
    def save_articles(cls, articles):

        for article in articles:
            try:
                # Sauvegarder l'article
                cls.objects.update_or_create(
                    url=article['url'],  # Vérification d'unicité
                    defaults={
                        'id': article.get('id', ''), # Associez l'id
                        'author': article.get('author', ''),
                        'title': article.get('title', ''),
                        'description': article.get('description', ''),
                        'url_to_image': article.get('urlToImage', ''),
                        'published_at': article.get('publishedAt', ''),
                        'content': article.get('content', ''),
                    }
                )
            except Exception as e:
                print(f"Erreur lors de la sauvegarde de l'article : {e}")

