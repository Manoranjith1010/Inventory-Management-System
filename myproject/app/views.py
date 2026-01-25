from django.shortcuts import render
from .models import Post  # <--- 1. Import your model

def home(request):
    # 2. Get all posts from the database
    all_posts = Post.objects.all() 
    
    # 3. Create a context dictionary to pass data to the template
    context = {
        'posts': all_posts
    }
    
    # 4. Pass the context as the third argument
    return render(request, 'home.html', context)

def about(request):
    return render(request, 'about.html')