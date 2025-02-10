from django.urls import path
from store.views import product_detail, add_to_cart, cart

urlpatterns = [
    path('product/<slug:slug>/', product_detail, name='product'),
    path('product/<slug:slug>/add-to-cart', add_to_cart, name='add-to-cart'),
    path('cart/', cart, name='cart'),
]