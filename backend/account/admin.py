from django.contrib import admin
from .models import Account, CA, CS, Legal, CAFirm, Founder

# Register your models here.
admin.site.register(Account)
admin.site.register(Founder)
admin.site.register(CA)
admin.site.register(CS)
admin.site.register(Legal)
admin.site.register(CAFirm)
