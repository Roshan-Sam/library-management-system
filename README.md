# Library Management System

Library Management System is a React Django project where you can View, Purchase, and Borrow Books easily.

## Installation

### Backend

1. Navigate to the server directory:

   ```bash
   cd server\librarymanagement

2. Install dependencies:

    pip install -r requirements.txt

3. Make sure MySQL is installed and running.

4. Configure database settings in settings.py:

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

5. Run database migrations:

    py manage.py makemigrations
    py manage.py migrate

6. Run the Django server:

   py manage.py runserver

### Frontend

1. Navigate to the client directory:

    cd client\librarymanagement

2. Initialize npm:

   npm init -y

3. Install dependencies:

   npm install

4. Start the development server:

    npm run dev

