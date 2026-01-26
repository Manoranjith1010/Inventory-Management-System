from mongoengine import Document, StringField, EmailField
from mongoengine import Document, ReferenceField, CASCADE


class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField()


class Post(Document):
    title = StringField(required=True)
    author = ReferenceField("User", reverse_delete_rule=CASCADE)
