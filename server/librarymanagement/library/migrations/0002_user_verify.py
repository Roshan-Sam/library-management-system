# Generated by Django 5.0.6 on 2024-05-13 13:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='verify',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
