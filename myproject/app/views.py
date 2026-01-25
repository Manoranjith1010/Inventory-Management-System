from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Hello! Welcome to my Django Site.</h1>")

def about(request):
    return HttpResponse("<h1>About Us</h1><p>This is a simple Django website.</p>")