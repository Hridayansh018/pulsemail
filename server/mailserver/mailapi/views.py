from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage, get_connection


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage, get_connection


@api_view(['POST'])
def send_mail_to_list(request):
    data = request.data
    recipient_emails = data.get('email_list')
    subject = data.get('subject')
    message = data.get('message')
    HOST_EMAIL = data.get('HOST_EMAIL')
    HOST_APP_PASSWORD = data.get('HOST_APP_PASSWORD')

    from_email = HOST_EMAIL

    if not all([
        recipient_emails,
        subject,
        message,
        HOST_APP_PASSWORD,
        HOST_EMAIL
    ]):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        connection = get_connection(username=HOST_EMAIL, password=HOST_APP_PASSWORD, fail_silently=False)

        for recipient_email in recipient_emails:
            email = EmailMessage(
                subject,
                message,
                from_email,
                [recipient_email],
                connection=connection)
            email.send(fail_silently=False)

        return Response(
            {"status": "Emails sent successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        import traceback
        error_message = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        return Response(
            {"error": error_message},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
