from django.urls import path
from .views import (
    SignupView,
    VerifyEmailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    CustomLoginView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),

    # LOGIN (uses SimpleJWT)
    #path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("login/", CustomLoginView.as_view(), name="login"),

    # REFRESH TOKEN
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # LOGOUT (blacklist refresh token)
    path("logout/", TokenBlacklistView.as_view(), name="token_blacklist"),

    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view()),
]
