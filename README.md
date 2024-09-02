# Library Management System

Library Management System is a React Django project where you can View, Purchase, and Borrow Books easily.

## Installation

### Backend

1. Navigate to the server directory:

   ```bash
   cd server\librarymanagement

2. Install dependencies:

   ```bash
    pip install -r requirements.txt

4. Make sure MySQL is installed and running.

5. Configure database settings in settings.py:

   ```bash
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

6. Run database migrations:

   ```bash
    py manage.py makemigrations
    py manage.py migrate

7. Run the Django server:

   ```bash
   py manage.py runserver

### Frontend

1. Navigate to the client directory:

   ```bash
    cd client\librarymanagement

2. Initialize npm:

   ```bash
   npm init -y

3. Install dependencies:

   ```bash
   npm install

4. Start the development server:

   ```bash
    npm run dev

