# 1. Use an official Python runtime as a parent image
FROM python:3.10-slim

# 2. Set environment variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

# 3. Set work directory inside the container
WORKDIR /app

# 4. Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 5. Copy the project code into the container
COPY . /app/

# 6. Default command to run the server
# Note: We bind to 0.0.0.0 so the container is accessible from outside
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]