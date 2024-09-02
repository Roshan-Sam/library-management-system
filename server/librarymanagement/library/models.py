from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import timedelta
from django.utils import timezone

# Create your models here.

class User(AbstractUser):
    profile = models.ImageField(upload_to='profile/',default='default profile.jpg',null=True,blank=True)
    verify = models.BooleanField(default=False,null=True,blank=True)
    phone = models.CharField(max_length=10, unique=True, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=100, null=True, blank=True)
    house_name = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=6, null=True, blank=True)

class AdminNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_notifications',null=True,blank=True)
    message = models.CharField(max_length=255,null=True,blank=True)
    reader = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False,null=True,blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)

class Book(models.Model):
    name = models.CharField(max_length=100,null=True,blank=True)
    author = models.CharField(max_length=100,null=True,blank=True)
    publisher_id = models.CharField(max_length=50,null=True,blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    stock = models.IntegerField(default=0,null=True,blank=True)
    description = models.TextField(null=True, blank=True)   
    category  = models.CharField(max_length=50,null=True,blank=True)
    image = models.ImageField(upload_to='book_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
      
class BookRating(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='book_ratings',null=True,blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='book_ratings',null=True,blank=True)
    rating = models.IntegerField(null=True, blank=True,default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Rental(models.Model):
    RENTAL_PERIOD_CHOICES = [
        ('7', '7 days'),
        ('24', '24 days'),
        ('month', '1 month'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='book_rentals', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='book_rentals', null=True, blank=True)
    rental_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    returned = models.BooleanField(default=False)
    lost = models.BooleanField(default=False)
    rental_period = models.CharField(max_length=10, choices=RENTAL_PERIOD_CHOICES, default='7')
    rental_amount = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)
    notified = models.BooleanField(default=False)       
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    return_date = models.DateField(null=True, blank=True)
    lost_date = models.DateField(null=True, blank=True)
         
class UserNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    notified = models.BooleanField(default=False)       

class Cart(models.Model):
    quantity = models.IntegerField(default=1,null=True,blank=True)
    book = models.ForeignKey(Book,on_delete=models.CASCADE,null=True,blank=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE,null=True,blank=True)
    
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=100, null=True, blank=True)
    house_name = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    confirm_order_status = models.BooleanField(null=True,blank=True,default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.IntegerField(null=True, blank=True)