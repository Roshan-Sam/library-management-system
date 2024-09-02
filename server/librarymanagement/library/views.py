from rest_framework.response import Response
from django.http import HttpResponseNotFound,HttpResponse
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.core.mail import EmailMultiAlternatives,EmailMessage,send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
import random
import string
from .serializers import UserSerializer,AdminNotificationSerializer,BookSerializer,BookRatingSerializer,RentalSerializer,UserNotificationSerializer,CartSerializer,OrderItemSerializer,OrderSerializer
from .models import User,AdminNotification,Book,BookRating,Rental,UserNotification,Cart,Order,OrderItem
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta,date
from django.contrib.auth.hashers import check_password
import json

# Create your views here.

@api_view(['GET'])
def index(request):
    return Response({"message":"hello"})

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data,partial=True)
    if serializer.is_valid():
        username=serializer.validated_data.get('username')
        email=serializer.validated_data.get('email')
        phone = serializer.validated_data.get('phone')
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with that email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(phone=phone).exists():
            return Response({'error': 'A user with that phone number already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = {
            'username': username,
            'email': email,
            'first_name': serializer.validated_data.get('first_name'),
            'last_name': serializer.validated_data.get('last_name'),
            'phone': serializer.validated_data.get('phone'),
            'state': serializer.validated_data.get('state'),
            'city': serializer.validated_data.get('city'),
            'street': serializer.validated_data.get('street'),
            'house_name': serializer.validated_data.get('house_name'),
            'pincode': serializer.validated_data.get('pincode'),
            'is_active': False
        }
        user = User.objects.create_user(**user_data)  
              
        subject = 'Email Verification' 
        html_message = render_to_string("email.html",{'username': username, 'email': email,'domain':get_current_site(request).domain,"protocol": 'https' if request.is_secure() else 'http'})
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL  
        to = email

        message = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=from_email,
            to=[to]
        )
        message.attach_alternative(html_message, "text/html")
        message.send()
        return Response({'message':'User created successfully'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def verify_email(request,email):
    try:
        user = User.objects.get(email=email)
        if user.verify:
            return HttpResponse("Email is already verified.")
        else:
            user.verify = True
            user.save()
        return HttpResponse("Please go back and check the sign-up page.")
    except User.DoesNotExist:
        return HttpResponseNotFound("Please go back and and sign up.")
    
@api_view(['POST'])
def verify_status(request,email):
    try:
        user = User.objects.get(email=email)
        if user.verify:
            return Response({'verified': True,"message":'Your account has been verified. Check you mail for login password, and please wait for login until the admin lets you in.'}, status=status.HTTP_200_OK)
        else:
            user.delete()
            return Response({'verified': False,"message":'Your account is not verified, so please signup again.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def send_password(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(email=email)
        if user.verify:
            random_password = generate_random_password()
            user.set_password(random_password)
            user.save()
            subject = 'Your Password.'
            message = f'Your password is: {random_password}'
            from_email = settings.DEFAULT_FROM_EMAIL  
            to = email
            email = EmailMessage(
                subject,
                message,
                from_email,
                [to],
            )
            email.send()
            
            user_data = {'id':user.id, 'username': user.username, 'email': user.email}
            return Response({'message': 'Password sent successfully','user_data':user_data}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'User is not verified'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

def generate_random_password():
    random_digits = ''.join(random.choices(string.digits, k=3))
    random_letters = ''.join(random.choices(string.ascii_letters, k=3))
    return random_digits + random_letters

@api_view(['POST'])
def notify_admin(request):
    try:
        message = request.data.get('message')
        notification_type = request.data.get('type')
        reader_id = request.data.get('id')
        
        admin_user = User.objects.get(is_staff=True)
        reader_user = User.objects.get(id=reader_id)
        notification = AdminNotification.objects.create(
            user=admin_user,
            message=message,
            reader=reader_user.id,
            type=notification_type,
        )
        return Response({'message': 'Admin notified successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Admin user does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = None

    if user is not None and user.check_password(password):
        if user.is_staff:
            user_details = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profile': user.profile.url if hasattr(user, 'profile') else None,
                'is_staff': user.is_staff,
                'is_active': user.is_active,        
            }
            refresh = RefreshToken.for_user(user)
            return Response({'token': str(refresh.access_token), 'user': user_details}, status=status.HTTP_200_OK)
        elif user.verify:
            if user.is_active:
                user_details = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile': user.profile.url if hasattr(user, 'profile') else None,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active, 
                    'first_name': user.first_name,
                    'last_name': user.last_name, 
                    'phone': user.phone,  
                    'state': user.state,
                    'city': user.city,
                    'street': user.street,
                    'house_name': user.house_name,
                    'pincode': user.pincode,
                }
                refresh = RefreshToken.for_user(user)
                return Response({'token': str(refresh.access_token), 'user': user_details}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'You are not been active, please wait untlil the admin lets you in.'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'message': 'You are not verified as user.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'message': 'Username or Password is not correct.'}, status=status.HTTP_401_UNAUTHORIZED)
            
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_notifications(request):
    try:
        notifications = AdminNotification.objects.all().order_by('-created_at')
        serializer = AdminNotificationSerializer(notifications, many=True)
        return Response({'notifications': serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_user(request, notification_id):
    try:
        notification = AdminNotification.objects.get(id=notification_id)
        user = User.objects.get(id=notification.reader)
        user.is_active = True
        user.save()

        notification.is_read = True
        notification.save()

        return Response({'message': 'User approved successfully'}, status=status.HTTP_200_OK)
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def decline_user(request, notification_id):
    try:
        notification = AdminNotification.objects.get(id=notification_id)
        user = User.objects.get(id=notification.reader)
        user.delete()
        
        notification.is_read = True
        notification.save()
        
        email_subject = 'Registration Declined'
        email_message = 'Your registration has been declined by the admin. Please sign up again.'
        from_email = settings.DEFAULT_FROM_EMAIL
        send_mail(email_subject, email_message, from_email, [user.email])
        return Response({'message': 'User registration declined and user deleted successfully'}, status=status.HTTP_200_OK)
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    try:
        notification = AdminNotification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    try:
        notification = AdminNotification.objects.get(id=notification_id)
        notification.delete()
        return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_200_OK)
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_upload(request):
    if request.method == 'POST':
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_books(request):
    if request.method == 'GET':
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', 0)        
        search_term = request.query_params.get('searchTerm', None)
        category = request.query_params.get('category', None)
        min_rating = request.query_params.get('minRating', None)
        max_rating = request.query_params.get('maxRating', None)  
        top_rated = request.query_params.get('topRated', None)

        try:
            if limit:
                limit = int(limit)
            offset = int(offset)
        except ValueError:
            return Response({"error": "Invalid limit or offset parameter"}, status=status.HTTP_400_BAD_REQUEST)

        books = Book.objects.all().order_by('-created_at')

        if search_term:
            books = books.filter(Q(name__icontains=search_term) | Q(author__icontains=search_term))

        if category:
            books = books.filter(category__iexact=category)

        if min_rating and max_rating:
            try:
                min_rating = float(min_rating)
                max_rating = float(max_rating)
                books = books.annotate(average_rating=Avg('book_ratings__rating')).filter(
                    average_rating__gte=min_rating, average_rating__lt=max_rating
                )
            except ValueError:
                return Response({"error": "Invalid minRating or maxRating parameter"}, status=status.HTTP_400_BAD_REQUEST)

        if limit is not None:
            books = books[offset:offset + limit]
        else:
            books = books[offset:]
        
        if top_rated:
            top_rated_books = Book.objects.annotate(average_rating=Avg('book_ratings__rating')).order_by('-average_rating')[:4]
            top_rated_serializer = BookSerializer(top_rated_books, many=True)
        else:
            top_rated_serializer = None

        serializer = BookSerializer(books, many=True)
        response_data = {
            'books': serializer.data,
            'top_rated_books': top_rated_serializer.data if top_rated_serializer else None
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_book(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookSerializer(book)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Book.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
 
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_book(request,book_id):
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Book.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_book(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        book.delete()
        return Response({'message':'book deleted successfully'}, status=status.HTTP_200_OK)
    except Book.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_verified_nonstaff_users(request):
    search_term = request.GET.get('search', '')
    users = User.objects.filter(is_staff=False, is_active=True, verify=True)
    if search_term:
        users = users.filter(username__icontains=search_term)
        
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)   

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_user_details(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request, user_id):
    try:
        orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
        serialized_orders = OrderSerializer(orders, many=True).data
        return Response(serialized_orders, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_orders(request):
    try:
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order.delete()
        return Response({'message': 'Order deleted successfully'}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request, uid):
    try:
        user = User.objects.get(id=uid)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_details = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profile': user.profile.url if hasattr(user, 'profile') else None,
                'is_staff': user.is_staff,
                'is_active': user.is_active,        
            }          
            return Response({"user": user_details}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile(request, uid):
    try:
        user = User.objects.get(id=uid)
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request, uid):
    try:
        user = User.objects.get(id=uid)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    old_password = request.data.get('oldpassword')
    new_password = request.data.get('newpassword')

    if not old_password or not new_password:
        return Response({'error': 'Both old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if old_password == new_password:
        return Response({'error': 'New password cannot be the same as the old password.'}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(old_password, user.password):
        return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_rented_books(request):
    try:
        rented_books = Rental.objects.filter(returned=False, lost=False).order_by('-id')
        serializer = RentalSerializer(rented_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_returned_books(request):
    try:
        returned_books = Rental.objects.filter(returned=True, lost=False).order_by('-return_date')
        serializer = RentalSerializer(returned_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_lost_books(request):
    try:
        lost_books = Rental.objects.filter(returned=False, lost=True).order_by('-lost_date')
        serializer = RentalSerializer(lost_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, oid):
    try:
        order = Order.objects.get(pk=oid)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    
    order.status = "completed"
    order.save()
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.delete()
        return Response(status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

# user routes 

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user_profile(request, uid):
    try:
        user = User.objects.get(id=uid)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_details = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profile': user.profile.url if hasattr(user, 'profile') else None,
                'is_staff': user.is_staff,
                'is_active': user.is_active,  
                'first_name': user.first_name,
                'last_name': user.last_name, 
                'phone': user.phone,  
                'state': user.state,
                'city': user.city,
                'street': user.street,
                'house_name': user.house_name,
                'pincode': user.pincode,      
            }          
            return Response({"user": user_details}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rent_book(request):
    try:
        user_id = request.data.get('user')
        book_id = request.data.get('book')
        rental_period = request.data.get('rental_period')

        if not user_id or not book_id or not rental_period:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        book = get_object_or_404(Book, id=book_id)

        current_date = date.today()

        if rental_period == '7':
            due_date = current_date + timedelta(days=7)
            rental_amount = 50.00
        elif rental_period == '24':
            due_date = current_date + timedelta(days=24)
            rental_amount = 55.00
        elif rental_period == 'month':
            due_date = current_date + timedelta(days=30)
            rental_amount = 60.00
        else:
            return Response({'error': 'Invalid rental period'}, status=status.HTTP_400_BAD_REQUEST)


        rental_data = {
            'user': user.id,
            'book': book.id,
            'rental_period': rental_period,
            'due_date': due_date,
            'rental_amount': rental_amount
        }

        serializer = RentalSerializer(data=rental_data,partial=True)
        if serializer.is_valid():
            serializer.save()
            book.stock -= 1
            book.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_user_rentals(request,user_id):
    try:
        rentals = Rental.objects.filter(user=user_id,returned=False,lost=False).order_by('-id')      
        serializer = RentalSerializer(rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Rental.DoesNotExist:
        return Response({'error': 'No rentals found for this user.'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def return_book(request,rental_id):
    try:
        rental = get_object_or_404(Rental, id=rental_id)
        if rental.returned:
            return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.returned = True
        rental.return_date = date.today()
        overdue_days = (date.today() - rental.due_date).days
        fine = 0  
        if overdue_days > 0:
            fine = 6.00 + (overdue_days * 1.00)
        
        rental.fine = fine
        rental.save()
        book = rental.book
        book.stock += 1
        book.save()
        
        rental_data = RentalSerializer(rental).data
        return Response({
            'message': 'Book returned successfully',
            'fine': fine,
            'rental': rental_data
        }, status=status.HTTP_200_OK)
        
    except Rental.DoesNotExist:
        return Response({'error': 'Rental not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def lost_book(request, rental_id):
    try:
        rental = get_object_or_404(Rental, id=rental_id)
        
        if rental.returned:
            return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.lost = True
        rental.lost_date = date.today()
        rental.fine = 60
        rental.save()
        
        return Response({'message': 'Book marked as lost successfully', 'fine_amount': rental.fine}, status=status.HTTP_200_OK)
        
    except Rental.DoesNotExist:
        return Response({'error': 'Rental not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def alert_overdue_rentals(request):
    try:
        overdue_rentals = Rental.objects.filter(due_date__lt=date.today(), returned=False, lost=False, notified=False)
        
        if not overdue_rentals.exists():
            return Response({'message': 'No overdue rentals to send notifications for'}, status=status.HTTP_200_OK)
        
        for rental in overdue_rentals:
            try:
                UserNotification.objects.create(
                    user=rental.user,
                    message=f'Rental overdue for book: {rental.book.name}. Please return immediately.'
                )
                
                admin_user = User.objects.get(is_staff=True)
                AdminNotification.objects.create(
                    user=admin_user,
                    message=f'User {rental.user.username} has an overdue rental for book: {rental.book.name}.',
                    type='overdue',
                    reader=rental.user.id
                )
                
                rental.notified = True
                rental.save()

            except Exception as e:
                print(f"Error processing rental {rental.id}: {e}")

        return Response({'message': 'Successfully sent overdue notifications'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error fetching overdue rentals: {e}")
        return Response({'message': 'An error occurred while sending overdue notifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request, user_id):
    try:
        notifications = UserNotification.objects.filter(user=user_id).order_by('-created_at')
        serializer = UserNotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserNotification.DoesNotExist:
        return Response({'error': 'No notifications found for this user'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return Response({'error': 'An error occurred while fetching notifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_user_notifications(request, user_id):
    try:
        notifications = UserNotification.objects.filter(user_id=user_id, notified=False).order_by('-created_at')
        serializer = UserNotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserNotification.DoesNotExist:
        return Response({'error': 'No notifications found for this user'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return Response({'error': 'An error occurred while fetching notifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_notified(request):
    try:
        notification_ids = request.data.get('notification_ids', [])
        UserNotification.objects.filter(id__in=notification_ids).update(notified=True)
        return Response({'message': 'Notifications marked as notified'}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error updating notifications: {e}")
        return Response({'error': 'An error occurred while updating notifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_user_notification_as_read(request, notification_id):
    try:
        notification = UserNotification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
    except UserNotification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_returned_books(request, user_id):
    rentals = Rental.objects.filter(user_id=user_id, returned=True, lost=False).order_by('-return_date')
    serializer = RentalSerializer(rentals, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lost_books(request, user_id):
    rentals = Rental.objects.filter(user_id=user_id, returned=False, lost=True).order_by('-lost_date')
    serializer = RentalSerializer(rentals, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    book_id = request.data.get('book')
    try:
        book = Book.objects.get(id=book_id)
        if book.stock <= 0:
            return Response({'error': 'Book out of stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CartSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            book.stock -= 1
            book.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request, user_id):
    carts = Cart.objects.filter(user_id=user_id)
    cart_count = carts.count()
    cart_details = CartSerializer(carts, many=True).data 
    return Response({'cart_count': cart_count, 'cart_details': cart_details}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    cart_item_id = request.data.get('id')
    new_quantity = request.data.get('quantity')

    try:
        cart_item = Cart.objects.get(id=cart_item_id)
        if new_quantity <= 0:
            return Response({'error': 'Quantity should be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        quantity_difference = new_quantity - cart_item.quantity

        cart_item.quantity = new_quantity
        cart_item.save()

        book = cart_item.book
        book.stock -= quantity_difference
        book.save()

        return Response({'message': 'Cart item quantity updated successfully'}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_cart_item(request):
    cart_item_id = request.data.get('id')
    
    try:
        cart_item = Cart.objects.get(id=cart_item_id)
        book = cart_item.book
        
        book.stock += cart_item.quantity
        book.save()
        
        cart_item.delete()
        
        return Response({'message': 'Cart item deleted successfully'}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user_id = request.data.get('user')
    state = request.data.get('state')
    city = request.data.get('city')
    street = request.data.get('street')
    house_name = request.data.get('house_name')
    pincode = request.data.get('pincode')
    total_amount = request.data.get('total_amount')
    cart_data = request.data.get('cart_data')
    user = User.objects.get(id=user_id)

    if not all([state, city, street, house_name, pincode, total_amount, cart_data]):
        return Response({'error': 'Incomplete information provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = Order.objects.create(
            user=user,
            state=state,
            city=city,
            street=street,
            house_name=house_name,
            pincode=pincode,
            total_amount=total_amount
        )
        
        for cart_item in cart_data:
            book = get_object_or_404(Book, id=cart_item['book'])
            OrderItem.objects.create(
            order=order,
            book=book,
            quantity=cart_item['quantity'],
        )
        
        send_confirmation_email(request, user, order)
        order_id = order.id

        return Response({'message': 'We have sent a confirmation mail, please confirm for successfully placing your order.','order_id':order_id}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_confirmation_email(request, user, order):
    subject = 'Order Confirmation'
    current_site = get_current_site(request)
    html_message = render_to_string('order_confirmation_email.html', {
        'user': user,
        'order': order,
        'domain': current_site.domain,
        'protocol': 'https' if request.is_secure() else 'http'
    })
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL
    send_mail(subject, plain_message, from_email, [user.email], html_message=html_message)

@api_view(['GET'])
def confirm_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        if order.confirm_order_status:
            return HttpResponse("Order already confirmed.")
        else:
            order.confirm_order_status = True
            order.save()
            return HttpResponse("Please go back and check the cart page.")
    except Order.DoesNotExist:
        return HttpResponseNotFound("Please go back and place your order again.")
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_confirm_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        if order.confirm_order_status:
            carts = Cart.objects.filter(user=order.user)
            carts.delete()
            serialized_order = OrderSerializer(order).data
            return Response({'message': 'Your order has been confirmed successfully.', 'order': serialized_order}, status=status.HTTP_200_OK)
        else:
            order.delete()
            return Response({'error': 'Your order has not been confirmed within the time limit. Please place the order again'}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_book_rating(request):
    if request.method == 'POST':
        user_id = request.data.get('user')
        book_id = request.data.get('book')
        rating_value = request.data.get('rating')

        try:
            user = User.objects.get(id=user_id)
            book = Book.objects.get(id=book_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        rating, created = BookRating.objects.get_or_create(user=user, book=book)
        rating.rating = rating_value
        rating.save()

        return Response({"message": "Rating added successfully"}, status=status.HTTP_200_OK)

    return Response({"error": "Invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)