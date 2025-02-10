from django.db import models
from django.shortcuts import get_object_or_404, render, reverse

from bayastore.settings import AUTH_USER_MODEL

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(max_length=128, unique=True)
    price = models. FloatField (default=0.0)
    stock = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="products", blank=True, null=True)
    
    def __str__(self):
        return f" {self.name} ({self.stock})"
    
    def get_absolute_url(self):
        return reverse("product", kwargs={"slug": self.slug})

class Order(models.Model): 
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    ordered = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Order for {self.product} by {self.user}"
    
    def get_total_price(self):
        return self.product.price * self.quantity
    
    def get_total_quantity(self):
        return self.quantity

class Cart(models.Model):
    user = models.OneToOneField(AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.ManyToManyField(Order)
    ordered = models.BooleanField(default=False)
    ordered_date = models.DateTimeField(auto_now_add=True, null=True)
    
    
    def __str__(self):
        return f"Cart for {self.user}"
    
    def get_total_price(self):
        total = 0
        for order in self.order.all():
            total += order.product.price
        return total
