from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Account
from django.core.mail import send_mail
from django.conf import settings
import jwt
from django.contrib.auth import login
from .utils import (
    generate_email_verification_jwt,
    generate_reset_token,
    verify_reset_token
)
from .serializers import (
    SignupSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT verification token
            token = generate_email_verification_jwt(user)
            verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

            # Send email
            send_mail(
                subject="Verify your email",
                message=f"Verify your account: {verify_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            response_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'mobile': user.mobile_number,
                'user_type': user.user_type,
                'registered_at': user.registered_at,
                "message": "User created. Check email to verify.",
                "verify_link": verify_link,
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request):
        token = request.GET.get("token")
        if not token:
            return Response({"error": "Token missing"}, status=400)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

            if payload.get("type") != "email_verification":
                return Response({"error": "Invalid token type"}, status=400)

            user = Account.objects.get(id=payload["user_id"], email=payload["email"])

            # Activate user
            user.is_active = True
            user.save()

            return Response({"message": "Email verified successfully!"})

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token expired"}, status=400)
        except jwt.DecodeError:
            return Response({"error": "Invalid token"}, status=400)
        except Account.DoesNotExist:
            return Response({"error": "User not found"}, status=400)

class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        # DO NOT CONFIRM WHETHER EMAIL EXISTS – prevent enumeration
        try:
            user = Account.objects.get(email=email)
            token = generate_reset_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

            send_mail(
                "Reset Your Password",
                f"Click the link to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )

        except Account.DoesNotExist:
            pass  # same response

        return Response(
            {"message": "If the email exists, a reset link has been sent.",
             "reset_link": reset_link,
            },
            status=status.HTTP_200_OK,
        )

class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        payload, error = verify_reset_token(token)
        if error:
            return Response({"error": error}, status=400)

        try:
            user = Account.objects.get(id=payload["user_id"])
        except Account.DoesNotExist:
            return Response({"error": "User not found"}, status=400)

        # Check reset_counter match → invalidates old tokens
        if payload["reset_counter"] != user.reset_counter:
            return Response({"error": "Token is no longer valid"}, status=400)

        # Change password
        user.set_password(new_password)
        user.token_version += 1   # 🔥 invalidate all tokens
        user.reset_counter += 1  # single-use token invalidation
        user.save()

        return Response({"message": "Password reset successful."})

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
