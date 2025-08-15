from django.test import TestCase, Client
from django.core import mail
from django.urls import reverse
import json

class MailAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('send_email_to_list') # Use the name from urls.py
        self.data = {
            'email_list': ['test@example.com'],
            'subject': 'Test Subject',
            'message': 'Test Message',
            'HOST_EMAIL': 'test@example.com',
            'HOST_APP_PASSWORD': 'password'
        }
        mail.outbox = []  # Clear the outbox

    def test_app_loads(self):
        self.assertEqual(1, 1)

    def test_send_email(self):
        # Set email backend to locmem for testing
        with self.settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post(
                self.url,
                data=json.dumps(self.data),  # Serialize the data
                content_type='application/json'
            )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(mail.outbox), 1)
            self.assertEqual(mail.outbox[0].subject, 'Test Subject')
            self.assertEqual(mail.outbox[0].to, ['test@example.com'])


