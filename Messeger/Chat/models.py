from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager,Group,Permission
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.authtoken.models import Token
from django.utils.html import escape, strip_tags
import re,json
from django.contrib.postgres.fields import JSONField
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
#for making a multiple select field in the admin panel site
#from multiselectfield import MultiSelectField
from django.core.exceptions import ValidationError
def alphanumeric_validator(value): #for the name and text to  be validated and avoid attacks
    #regex = re.compile(r'^[a-zA-Z0-9]*$')
    regex = re.compile(r'^[a-zA-Z0-9.,\'\s]*$')
    if not regex.match(value):
        raise ValidationError('Only alphanumeric characters are allowed.')

def json_validator(value): #for the name and text to  be validated and avoid attacks
    try:
        data = json.loads(value)
        if not isinstance(data, list):
            raise ValidationError('ChatLog must be a list')
        for item in data:
            if not isinstance(item, dict):
                raise ValidationError('Each item in ChatLog must be a dictionary')
    except json.JSONDecodeError:
        raise ValidationError('Invalid JSON')


def sanitize_string(input_string):
    # Escape any HTML tags
    escaped_string = escape(input_string)

    # Remove all HTML tags
    sanitized_string = strip_tags(escaped_string)

    return sanitized_string


class AccountManager(BaseUserManager):
   
    def create_user(self,email,name, password=None):
        if not email:
            raise ValueError("User must have an email address")
             
        
            
        email = self.normalize_email(email)
        name = sanitize_string(name)
        SanitizedName = sanitize_string(name)
        user = self.model(email=email, name=SanitizedName)        
        user.set_password(str(password))
        user.is_active = True 
        
        user.save(using=self._db)
        # user_pk = user.id
        # detail = {
        #         email : {
        #             'name' : name,
        #             'about' : 'Hey there am new to this applicaiton.',
        #             'id' : user_pk,
        #             'ProfilePic' : 'http://127.0.0.1:8000/media/images/fallback.jpeg'
        #         }
        #     }
        # now = datetime.datetime.now()
        # short_date = now.strftime("%Y-%m-%d")   
        # PersonalChats.objects.create(group_name = user_pk,RecieverId = '',SenderId = user_pk,Details = detail,DateCreated = str(short_date))
        # print('doo')
        return user

    def create_superuser(self,email, name,password=None):
        if not email:
            raise ValueError("User must have an email address")
        
        email = self.normalize_email(email)
        SanitizeName = sanitize_string(name)
        user = self.create_user( email=email, name=SanitizeName)        
        user.set_password(str(password))
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        detail = {
                email : {
                    'name' : user.name,
                    'about' : user.about,
                    'id' : user.id
                }
            }
        
        # assigning permission to the user
        content_types = ContentType.objects.all()
        for permission in Permission.objects.filter(content_type__in=content_types):
            user.user_permissions.add(permission)
        user.save(using=self._db)
        return user 


__all__ = ['Account']

class Account(AbstractBaseUser,PermissionsMixin):

    #id = models.UUIDField(primary_key=True, default=uuid.UUID, editable=False)
    email = models.EmailField(max_length=40, validators=[EmailValidator()], unique=True)
    name = models.CharField(max_length=30, validators=[alphanumeric_validator])
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    rattings = models.IntegerField(default=1)
    JobsHistory =  models.JSONField(blank=True,null=True)
    requestedJobs = models.JSONField(blank=True,null=True)   
    ProfilePic = models.ImageField(upload_to='images/',default='images/fallback.jpeg',verbose_name='Profile Picture', blank=True )
    about = models.CharField(verbose_name='About',validators=[alphanumeric_validator], blank=True, null=True,max_length=80)
    
    groups = models.ManyToManyField(
        Group,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name
    
    def __str__(self):
        return f'{self.name} ※ {self.email}'
    objects = AccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
# this is for creating a balcklist method

class NotePad(models.Model):
    email = models.EmailField(db_index=True,max_length=50,validators=[EmailValidator],blank=True,null=True)
    DateCreated = models.CharField(blank=True,null=True)
    LastText = models.TextField(blank=True,null=True,default='last text')
    NoteLog =  models.JSONField(blank=True,null=True)   
    title = models.TextField(blank=True,null=True,unique=True)



