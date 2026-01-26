from django_mongoengine import mongo_admin
from .models import Post

class PostAdmin(mongo_admin.DocumentAdmin):
    list_display = ('title', 'author')

mongo_admin.site.register(Post, PostAdmin)
