from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse
from store.models import Product, Cart, Order


# Create your views here.


def index(request) :
    products = Product.objects.all()
    return render(request, 'store/index.html', context={"products": products})



def product_detail(request, slug) :
    product = get_object_or_404(Product, slug=slug)
    return render(request, 'store/detail.html', context={"product": product})

def add_to_cart(request, slug) :
    
    user = request.user
    
    product = get_object_or_404(Product, slug=slug)
    
    cart, _ = Cart.objects.get_or_create(user=user)
    
    order, created = Order.objects.get_or_create(user=user, product=product)
    
    if created:
        cart.order.add(order)
        cart.save()
    else :
        order.quantity += 1
        order.save()
    
    
    return redirect(reverse("product", kwargs={"slug": slug}))

def cart(request) :
    user = request.user
    cart = get_object_or_404(Cart, user=user)
    return render(request, 'store/cart.html', context={"orders": cart.order.all()})

#<link rel="stylesheet" href="/static/css/styles.css">