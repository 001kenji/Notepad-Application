from django.urls import re_path,path
from . import views
urlpatterns = [
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
]
