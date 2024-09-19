from django.contrib import admin
from .models import Account
from django.contrib import admin
from django.contrib.auth.models import Group
from datetime import datetime
admin.site.site_title = 'login admin'
admin.site.site_header = 'LOGIN'
admin.site.site_index = 'Welcome Back'
from django.contrib.admin import site

from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent


class OutstandingTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at','expires_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at',)

class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'blacklist_date','blacklist_at')
    search_fields = ('user__email', 'user__username', 'token')
    list_filter = ('blacklist_date',)

ActiveUser = Account.objects.all()
class UserAccountAdmin (admin.ModelAdmin):
    
    list_display=('name','email','is_staff')
    exclude=['JobsHistory,rattings','requestedJobs']
    list_filter=['is_staff','is_active','is_superuser']

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)

        New_fieldsets = (
            (None, {
            'fields': ('email', 'name','password','is_active', 'is_staff','is_superuser')
        }),
        ('Profile',{
            'fields' : ('ProfilePic','about')
        })
        ,)
       
        return New_fieldsets 
    
    readonly_fields=('id',)

    
admin.site.register(Account, UserAccountAdmin)

