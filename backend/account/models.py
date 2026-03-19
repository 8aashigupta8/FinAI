from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import PermissionsMixin, AbstractBaseUser
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, mobile_number, user_type, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            name=name,
            mobile_number=mobile_number,
            user_type=user_type,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        # Set defaults for custom required fields
        mobile_number = extra_fields.pop('mobile_number', '0000000000')
        user_type = extra_fields.pop('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(
        email=email,
        name=name,
        mobile_number=mobile_number,
        user_type=user_type,
        password=password,
        **extra_fields
        )

class Account(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('Founder/Co-founder', 'Founder/Co-founder'),
        ('CA (Chartered Accountant)', 'CA (Chartered Accountant)'),
        ('CS (Company Secretary)', 'CS (Company Secretary)'),
        ('Legal', 'Legal'),
        ('Firm', 'Firm'),
    )
    is_staff      = models.BooleanField(default=False)
    email         = models.EmailField(unique=True)
    name          = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=15)
    is_active     = models.BooleanField(default=False)
    user_type     = models.CharField(max_length=50, choices=USER_TYPE_CHOICES)
    registered_at = models.DateTimeField(auto_now_add=True)
    reset_counter = models.PositiveIntegerField(default=0)
    token_version = models.PositiveIntegerField(default=0)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'user_type'],
                name='unique_email_per_type'
            )
        ]

class Founder(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True)

class CA(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True)

class CS(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True)

class Legal(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True)

class CAFirm(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True)
