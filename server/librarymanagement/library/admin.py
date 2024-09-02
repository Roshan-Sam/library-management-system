from django.contrib import admin
from .models import User,AdminNotification,Book,BookRating,Rental,UserNotification,Cart,Order,OrderItem

# Register your models here.

admin.site.register(User)
admin.site.register(AdminNotification)
admin.site.register(Book)
admin.site.register(BookRating)
admin.site.register(Rental)
admin.site.register(UserNotification)
admin.site.register(Cart)
admin.site.register(Order)
admin.site.register(OrderItem)
