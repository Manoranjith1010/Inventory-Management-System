from django.urls import path
from .views import home, about

urlpatterns = [
    path('', home, name='home'),        # The empty string '' means the homepage
    path('about/', about, name='about'),
]