from rest_framework import serializers
from .models import User,AdminNotification,Book,BookRating,Rental,UserNotification,Cart,Order,OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = '__all__'
        
class AdminNotificationSerializer(serializers.ModelSerializer):
    reader_details = serializers.SerializerMethodField()

    class Meta:
        model = AdminNotification
        fields = '__all__'

    def get_reader_details(self, obj):
        if obj.reader:
            try:
                reader = User.objects.get(id=obj.reader)  
                return UserSerializer(reader).data
            except User.DoesNotExist:
                return None
        else:
            return None
        
        
class BookRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = BookRating
        fields = '__all__'
        
class BookSerializer(serializers.ModelSerializer):
    book_ratings = BookRatingSerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = '__all__'
        
class RentalSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    book_details = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = '__all__'

    def get_user_details(self, obj):
        if obj.user:
            return UserSerializer(obj.user).data
        return None

    def get_book_details(self, obj):
        if obj.book:
            return BookSerializer(obj.book).data
        return None
    
class UserNotificationSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = '__all__'

    def get_user_details(self, obj):
        if obj.user:
            return UserSerializer(obj.user).data
        return None
    
class CartSerializer(serializers.ModelSerializer):
    book_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = '__all__'

    def get_book_details(self, obj):
        if obj.book:
            return BookSerializer(obj.book).data
        return None

    def get_user_details(self, obj):
        if obj.user:
            return UserSerializer(obj.user).data
        return None
    
class OrderItemSerializer(serializers.ModelSerializer):
    book_details = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = '__all__'
        
    def get_book_details(self, obj):
        if obj.book:
            return BookSerializer(obj.book).data
        return None

class OrderSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_user_details(self, obj):
        if obj.user:
            return UserSerializer(obj.user).data
        return None

   