from django.db import models
from django.contrib.auth.models import User  # Import the built-in User model

class Post(models.Model):
    # Short text field (e.g., for the article headline)
    title = models.CharField(max_length=200)
    
    # Link to a User (if the user is deleted, delete their posts too)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Long text field (for the main content)
    body = models.TextField()
    
    # Automatically set the date/time when created
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Automatically update the date/time whenever saved
    updated_at = models.DateTimeField(auto_now=True)

    # This method determines what the object looks like in the Admin panel
    def __str__(self):
        return self.title + ' | ' + str(self.author)