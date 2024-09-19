import { useEffect } from 'react';
import Notifier from '../Components/notifier'
import {
    NotePadlogsReducer,
    NoteChatLogReducer
}from '../actions/types'


const initialState = {
    NotePadlogs : []
};

export default function (state = initialState, action) {

  
    const { type, payload} = action;
    
        //console.log('fired')
    switch (type) {
        
        case NotePadlogsReducer:
            return {
                ...state,
                NotePadlogs : payload
            }    
        case 'ClearLists':
            return {
                ...state,
                GroupList : [],
                PendingRequest : [],
                RequestList :[],
                MemeberList : [],
                RejectList : [],
                BannedList : [],
                SuggestedList : [],

            }        
        default:
            return state
    }

   
}