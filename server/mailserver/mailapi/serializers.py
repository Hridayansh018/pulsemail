from rest_framework import serializers

class EmailSerializer(serializers.Serializer):
    emails = serializers.ListField(child=serializers.EmailField())
    sender_gmail = serializers.EmailField()
    app_password = serializers.CharField()
    subject = serializers.CharField()
    content = serializers.CharField()