# Generated by Django 5.0.6 on 2024-05-30 08:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0020_order_confirm_order_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='confirm_order_status',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
