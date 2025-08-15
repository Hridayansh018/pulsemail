# mailapi/urls.py
from django.urls import path
from .views import send_mail_to_list

urlpatterns = [  # This MUST be a list
    path('send-mails/', send_mail_to_list, name='send_email_to_list'),
]