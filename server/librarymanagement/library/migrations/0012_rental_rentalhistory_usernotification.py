# Generated by Django 5.0.6 on 2024-05-21 06:19

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0011_alter_book_created_at_alter_book_updated_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rental',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rental_date', models.DateTimeField(auto_now_add=True)),
                ('due_date', models.DateTimeField()),
                ('returned', models.BooleanField(default=False)),
                ('lost', models.BooleanField(default=False)),
                ('rental_period', models.CharField(choices=[('7', '7 days'), ('24', '24 days'), ('month', '1 month')], default='7', max_length=10)),
                ('default_rent_price', models.DecimalField(decimal_places=2, default=50.0, max_digits=6)),
                ('rental_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=6)),
                ('book', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='book_rentals', to='library.book')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='book_rentals', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='RentalHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rental_date', models.DateTimeField()),
                ('return_date', models.DateTimeField(blank=True, null=True)),
                ('due_date', models.DateTimeField()),
                ('fine', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rental_histories', to='library.book')),
                ('rental', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='rental_history', to='library.rental')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rental_histories', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
