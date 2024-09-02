LIBRARY MANAGEMENT SYSTEM

Library Management System is a React Django project where you can View, Purchase and Borrow Books easily.

Installation
Backend
Navigate to the server directory:

cd server\librarymanagement
Install dependencies:

pip install -r requirements.txt
Make sure MySQL is installed and running.

Configure database settings in settings.py:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
Run database migrations:

py manage.py makemigrations
py manage.py migrate
Run the Django server:

py manage.py runserver
Frontend
Navigate to the client directory:

cd client\librarymanagement
Initialize npm:

npm init -y
Install dependencies:

npm install
Start the development server:

npm run dev
