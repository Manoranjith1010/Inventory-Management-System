from pathlib import Path
from mongoengine import connect

# ----------------------------
# MongoDB Configuration
# ----------------------------
connect(
    db="my_djangoproject_db",
    host="localhost",
    port=27017
)

# ----------------------------
# Base Directory
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ----------------------------
# Security
# ----------------------------
SECRET_KEY = "django-insecure-6td(1$xl#xzoq60b)s@@z4h^5c&v*ya=%ac#q^_ol*!ar-k*%l"
DEBUG = True
ALLOWED_HOSTS = []

# ----------------------------
# Installed Apps
# ----------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "app",
    "django_mongoengine", 
    "django_mongoengine.mongo_admin",
]

# ----------------------------
# Middleware
# ----------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# ----------------------------
# Templates
# ----------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ----------------------------
# MySQL Database Configuration (Django ORM)
# ----------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "my_mysql_db",
        "USER": "mysql_user",
        "PASSWORD": "mysql_password",
        "HOST": "localhost",
        "PORT": "3306",
    }
}

# ----------------------------
# Password Validation
# ----------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ----------------------------
# Internationalization
# ----------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ----------------------------
# Static Files
# ----------------------------
STATIC_URL = "static/"

# ----------------------------
# Default Primary Key Field
# ----------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
