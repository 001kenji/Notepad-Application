# chat/consumers.py
import json,threading,datetime
from django.core.files.storage import FileSystemStorage
import time,os
from asgiref.sync import sync_to_async,async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ValidationError
from .models import Account,NotePad
from channels.db import database_sync_to_async
from django.core.files.storage import default_storage
from django.db.models import Q
from circuitbreaker import circuit
#from ..Messeger.settings import redisConnection

@circuit
@database_sync_to_async
def NotePadlogs(email):
    val = list(NotePad.objects.all().filter(email = email).values())
    return val

@circuit
@database_sync_to_async
def AddNoteFunc(email,title):
    now = datetime.datetime.now()
    short_date = now.strftime("%Y-%m-%d")
    try:
        x = NotePad.objects.create(
        email = str(email),
        DateCreated = str(short_date),
        title = str(title)    
        )
        x.save
    except Exception as e:
        return {'status' : 'warning','message': f'Request Removed, duplicate title'}

    
    val = list(NotePad.objects.all().filter(email = email).values())
    return val

@circuit
@database_sync_to_async
def SubmitNoteFunc (email,text,title):
    data = list(NotePad.objects.all().filter(email = email,title = title).values())
    if(len(data) != 0 and email != 'null'):
        now = datetime.datetime.now()
        short_date = now.strftime("%Y-%m-%d")
        x = NotePad.objects.all().filter(email = email,title = title).values()
        chat = data[0]['NoteLog']
        if(chat != None):             
            chat.append({
                "text" : text,
                "time" : str(short_date),
            })
        else:
            chat = [{
                "text" : text,
                "time" : str(short_date),
            }]
        x.update(NoteLog = chat)
        valtext = text[:15]
        x.update(LastText = str(valtext))
        NotePad.save 
        return chat

    else:
        return {'status' : 'warning','message': f'Invalid data or Chat not found'}

@circuit
@database_sync_to_async
def NotePadlogsDelete(email,title):
    try:
        NotePad.objects.filter(email = email,title = title).delete()
        val = list(NotePad.objects.all().filter(email = email).values())
        return val
    except Exception as e:
        return {'status' : 'error','message': f'Error occured when deleting note.'}

class ChatList(AsyncWebsocketConsumer):
    async def connect(self):    
       
        await self.accept() 
        

    async def disconnect(self, close_code):      
        pass


    async def send_msg(self, data,type):
        
        await self.send(
            text_data=json.dumps(
                {
                    'type' : type,
                    "message": data,
                }
            )
        )   

    #recieve message from websocket
    async def receive(self, text_data=None,bytes_data=None):
        file_name = ''
        date = datetime.datetime.now()
        #return
        if isinstance(bytes_data,bytes):         
            
            file_buffer =bytes_data
            #file_name = 'loginPreview.png'  # Replace with a unique file name
            if default_storage.exists(file_name):
                pass
                # Duplicate found, handle it (e.g., raise an error, rename the file)
            else:
                with default_storage.open(file_name, 'wb') as f:
                    f.write(file_buffer)
            # Handle the uploaded file as needed
            
            await self.send_msg(data='Success',type='Upload')
        else:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            if(message == 'NotePadlogs'):
                email = text_data_json['email']
                if email != 'null' :
                    val = await NotePadlogs(email=email)            
                    await self.send_msg(data=val,type='NotePadlogs')
                else:
                    val = {'status' : 'error','message' : 'invalid email'}
                    await self.send_msg(data=val,type='NotePadlogs')
            elif(message == 'NotePadlogsDelete'):
                email = text_data_json['email']
                title = text_data_json['title']
                if email != 'null' and title != 'null' :
                    val = await NotePadlogsDelete(email=email, title = title)            
                    await self.send_msg(data=val,type='NotePadlogsDelete')
                else:
                    val = {'status' : 'error','message' : 'invalid email'}
                    await self.send_msg(data=val,type='NotePadlogsDelete')
            elif(message == 'SubmitNoteChat'):
                email = text_data_json['email']
                title = text_data_json['title']
                text = text_data_json['text']
                val = await SubmitNoteFunc(email = email, title = title,text=text)
                await self.send_msg(data=val,type='SubmitNoteChat')
            elif(message == 'AddNote'):
                email = text_data_json['email']
                title = text_data_json['title']
                val = await AddNoteFunc(title= title, email = email)
                await self.send_msg(data=val,type='AddNote')
           






                 




   

