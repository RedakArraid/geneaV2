from django.contrib import messages
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.shortcuts import redirect, render

User = get_user_model()

def signup(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return redirect("index")
    
    return render(request, 'accounts/signup.html')

def login_user(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect("index")
        else:
            messages.error(request, "Nom d'utilisateur ou mot de passe incorrect.")
    return render(request, 'accounts/login.html')

def logout_user(request):
    logout(request)
    return redirect("index")