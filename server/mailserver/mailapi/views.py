from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage, get_connection
from django.core.exceptions import ValidationError
from django.core.validators import validate_email


def _normalize_to_list(value, length: int, field_name: str):
    """
    Accept either a single string or a list; broadcast single string to the given length.
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value] * length
    raise ValueError(f"{field_name} must be a string or an array of strings")


def _validate_email_or_400(address: str, label: str):
    if not isinstance(address, str):
        raise ValidationError(f"{label} must be a string")
    validate_email(address)


@api_view(['POST'])
def send_mail_to_list(request):
    data = request.data or {}

    email_list = data.get('email_list')
    subject_input = data.get('subject')
    message_input = data.get('message')
    HOST_EMAIL = data.get('HOST_EMAIL')
    HOST_APP_PASSWORD = data.get('HOST_APP_PASSWORD')

    # Validate basic structure
    if not isinstance(email_list, list) or len(email_list) == 0:
        return Response({"error": "email_list must be a non-empty array of recipient emails"}, status=status.HTTP_400_BAD_REQUEST)

    if not isinstance(HOST_EMAIL, str) or not isinstance(HOST_APP_PASSWORD, str):
        return Response({"error": "HOST_EMAIL and HOST_APP_PASSWORD must be provided as strings"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate email formats
    try:
        _validate_email_or_400(HOST_EMAIL, "HOST_EMAIL")
        for e in email_list:
            _validate_email_or_400(e, "recipient email")
    except ValidationError as ve:
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

    # Normalize subject and message to lists; allow single string broadcast
    try:
        subjects = _normalize_to_list(subject_input, len(email_list), 'subject')
        messages = _normalize_to_list(message_input, len(email_list), 'message')
    except ValueError as ve:
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure lengths align
    if len(subjects) != len(email_list) or len(messages) != len(email_list):
        return Response(
            {"error": "email_list, subject, and message must have matching lengths (or provide a single subject/message to apply to all)"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate types inside subjects/messages
    if not all(isinstance(s, str) for s in subjects) or not all(isinstance(m, str) for m in messages):
        return Response({"error": "All subject and message entries must be strings"}, status=status.HTTP_400_BAD_REQUEST)

    # Establish SMTP connection (Gmail defaults). Adjust if using a different provider.
    connection = None
    try:
        connection = get_connection(
            host="smtp.gmail.com",
            port=587,
            username=HOST_EMAIL,
            password=HOST_APP_PASSWORD,
            use_tls=True,
            fail_silently=False,
        )
        # Open connection once for multiple sends
        try:
            connection.open()
        except Exception:
            # Some backends lazily open; continue
            pass

        results = []
        for idx, recipient in enumerate(email_list):
            subject = (subjects[idx] or "").strip()
            body = messages[idx] or ""
            try:
                email = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=HOST_EMAIL,
                    to=[recipient],
                    connection=connection,
                )
                email.send(fail_silently=False)
                results.append({"to": recipient, "status": "sent"})
            except Exception as e:
                results.append({"to": recipient, "status": "failed", "error": str(e)})

        sent = sum(1 for r in results if r["status"] == "sent")
        failed = len(results) - sent

        return Response(
            {
                "success": failed == 0,
                "sent": sent,
                "failed": failed,
                "total": len(results),
                "results": results,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        import traceback
        error_message = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        return Response({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    finally:
        try:
            if connection:
                connection.close()
        except Exception:
            pass
