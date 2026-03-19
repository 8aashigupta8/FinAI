from rest_framework import serializers
from .models import Account, CA, CS, Legal, CAFirm, Founder
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = Account
        fields = ("name", "email", "mobile_number", "user_type", "password")

    def validate_email(self, value):
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        user = Account.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            mobile_number=validated_data['mobile_number'],
            password=validated_data['password'],
            user_type=validated_data['user_type'],
        )

        if user.user_type == 'Founder/Co-founder':
            Founder.objects.create(
                account=user,
            )

        if user.user_type == 'CA':
            CA.objects.create(
                account=user,
            )

        if user.user_type == 'CS':
            CS.objects.create(
                account=user,
            )

        if user.user_type == 'Legal':
            Legal.objects.create(
                account=user,
            )

        if user.user_type == 'CA Firm':
            CAFirm.objects.create(
                account=user,
            )
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["token_version"] = user.token_version
        return token

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def validate_new_password(self, value):
        validate_password(value)
        return value
