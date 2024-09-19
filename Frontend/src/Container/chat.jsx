import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import '../App.css'
import Navbar from "../Components/navbar";
import { Link, Navigate, generatePath, json } from "react-router-dom";
import {connect, useDispatch, useSelector} from 'react-redux'
import { login,CheckAuthenticated,logout,load_user } from "../actions/auth";
import { RiDeleteBinLine } from "react-icons/ri";
import { LiaSearchengin } from "react-icons/lia";
import { IoMdAdd } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { GiMoonClaws } from "react-icons/gi";
import { RxSun } from "react-icons/rx";
import {  NotePadlogsReducer, ToogleTheme } from "../actions/types";
import { toast  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoSendSharp } from "react-icons/io5";
import { GoArrowLeft } from "react-icons/go";

const Chat = (props,{logout, UploadFile, load_user,isAuthenticated}) => {
    
    const dispatch = useDispatch()
    const Theme = useSelector((state)=> state.auth.Theme)
    const User = useSelector((state) => state.auth.user)
    const [ShowEmoji,SetShowEmoji] = useState(false)
    const UserEmail = User != null ? User.email : 'null@gmail.com'
    const [ShowSearch,SetShowSearch] = useState(true)
    const WsDataStream = useRef(null)
    const NoteChatLogContainer = useRef(null)
    const [ShowNotePad, SetShowNotePad] = useState(false)
    const [NotePadComponents,SetNotePadComponents] = useState({
        'addNote' : false,
        'WriteNotes' : false,
        'NewNoteTitle' : '',
        'SelectedTitle' : '',
        'chatMessage' : '',
        'NoteList': true,
        'ShowNoteChatLog' : false
    })
    const [NotePadChat,SetNotePadChat] = useState([null])
    const [NotePadlogs,SetNotePadlogs] = useState(useSelector((state) => state.chatReducer.NotePadlogs))
    const [NoteChatLog,SetNoteChatLog] = useState([])
    const [getUser,setGetUser] = useState(true)
    //isauthenticated ? redirect to home page
    if (!isAuthenticated && localStorage.getItem('access') == 'undefined') {
       // console.log('your are authenticated in the login sect', isAuthenticated)

        return <Navigate to="/login" replace />;
    }
    if(localStorage.getItem('access') == null /*|| db == null*/) {
        logout;
        return <Navigate to="/login" replace />;
    }   
    useEffect(() => {
        if(getUser){
            props.CheckAuthenticated();
            props.load_user()
            setGetUser(false) 
        }
           
    },[])
    const SetTheme  = (props) => {
            dispatch({
                type : ToogleTheme,
                payload : props
            }
            )
    }

    useLayoutEffect(() => { 
        requestWsStream('open',null,null)
       
    },[])
    useEffect(() => {
        if(!navigator.onLine){
          toast('You are currently offline !', {
          type: 'warning', 
          theme: Theme,
          position: 'top-right',
        });
        }else {
        //   toast('Online.', {
        //     type: 'success', 
        //     theme: Theme,
        //     position: 'top-right',
        //   });
        }
        
      },[navigator.onLine])
    
    useEffect(() => {
        if(ShowNotePad){
            requestWsStream('NotePadlogs',null,null)
        }
    },[ShowNotePad])
  
    function SearchFunc () {

    }       
    const requestWsStream = (msg = null,room = null,body = null) => {    

        if(msg =='open'){
            
            if(WsDataStream.current != null ){
                WsDataStream.current.close(1000,'Opening another socket for less ws jam')

            }
            WsDataStream.current =  new WebSocket(`ws:/${import.meta.env.VITE_WS_API}/ws/chatList/`);

        }

        WsDataStream.current.onmessage = function (e) {
          var data = JSON.parse(e.data)
            if(data.type == 'NotePadlogs') {
                if(!data.message.status){
                    SetNotePadlogs(data.message)
                    dispatch({
                        type : NotePadlogsReducer,
                        payload : data.message
                    }
                    )
                }else{
                    toast(data.message.message, {
                        type: data.message.status ,
                        theme: Theme,
                        position: 'top-center'
                    }) 
                }
                
            }else if (data.type == 'AddNote'){
                if(!data.message.status){
                    SetNotePadlogs(data.message)
                    dispatch({
                        type : NotePadlogsReducer,
                        payload : data.message
                    }
                    )
                    toast('Added Successfuly', {
                        type: 'success',
                        theme: Theme,
                        position: 'top-center'
                    })
                }else{
                    toast(data.message.message, {
                        type: data.message.status ,
                        theme: Theme,
                        position: 'top-center'
                    }) 
                }
            }else if (data.type == 'SubmitNoteChat'){
                if(!data.message.status){
                    SetNoteChatLog(data.message)                   
                    
                }else{
                    toast(data.message.message, {
                        type: data.message.status ,
                        theme: Theme,
                        position: 'top-center'
                    }) 
                }
            }else if (data.type == 'NotePadlogsDelete'){
                if(!data.message.status){
                    SetNotePadlogs(data.message)
                    dispatch({
                        type : NotePadlogsReducer,
                        payload : data.message
                    }
                    )
                    toast('Deleted Successfuly', {
                        type: 'success',
                        theme: Theme,
                        position: 'top-center'
                    })                  
                    
                }else{
                    toast(data.message.message, {
                        type: data.message.status ,
                        theme: Theme,
                        position: 'top-center'
                    }) 
                }
            }
        };
        WsDataStream.current.onopen = (e) => {
          toast('Connection Established', {
              type: 'success',
              theme: Theme,
              position: 'top-right',
          })          
          WsDataStream.current.send(
            JSON.stringify({
                'message' : 'NotePadlogs',
                'email' : User != null ? User.email : 'null'
            })
            )
        }
        WsDataStream.current.onclose = function (e) {
          //console.log('closing due to :',e)
          toast('Connection Closed', {
              type: 'error',
              theme: Theme,
              position: 'top-right',
          })
        }
        if(WsDataStream.current.readyState === WsDataStream.current.OPEN){
            if(msg == 'SubmitNoteChat') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'SubmitNoteChat',
                        'title' : NotePadComponents.SelectedTitle,
                        'email' : User != null ? User.email : 'null',
                        'text' : NotePadComponents.chatMessage
                    })
                    )
            }else if(msg == 'NotePadlogsDelete') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'NotePadlogsDelete',
                        'email' : User != null ? User.email : 'null',
                        'title' : body
                    })
                    )
            }else if(msg == 'AddNote') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'AddNote',
                        'email' : User != null ? User.email : 'null',
                        'title' : NotePadComponents.NewNoteTitle
                    })
                    )
            }else if(msg == 'NotePadlogs') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'NotePadlogs',
                        'email' : User != null ? User.email : 'null'
                    })
                    )
            }else {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : String(msg)
                    })
                    )
            }
            
        }
        
    }  
  
   function Addnote (event) {
        
        const {value,name} = event.target
        SetNotePadComponents((e) => {
            return {
            ...e,
            [name] : value
            }
        })
        
    }
    function AddNoteFunc(props) {
        if(props == 'show'){
            SetNotePadComponents((e) => {
                    return {
                    ...e,
                    'addNote' : true,
                    'NoteList' : false,
                    'ShowNoteChatLog' : false
                    }
                })
        }else if(props == 'Add'){
            if(User != null && User.email != ''){
                    requestWsStream('AddNote',null,null)
                    toast('Processing', {
                        type: 'info',
                        theme: Theme,
                        position: 'top-center'
                    })
                    SetNotePadComponents((e) => {
                        return {
                        ...e,
                        'addNote' : false,
                        'NoteList' : true,
                        'ShowNoteChatLog' : false
                        }
                    }) 
            }else{
                toast('invalid email',{
                    type : 'warning',
                    theme : Theme,
                    position : "top-right"
                })
            
            }
        }
        
    }
    function OpenNoteChat(props,title = null) {
    
        if(props != null && props != 'null') {
            SetNotePadComponents((e) => {
                return {
                ...e,
                'addNote' : false,
                'NoteList' : false,
                'ShowNoteChatLog' : true,
                'SelectedTitle' : title,
                }
            })

             
            
            var val = NotePadlogs[props].NoteLog
            val ? SetNoteChatLog(val) : SetNoteChatLog([])
            
        }

    }
    function SubmitNoteChatFunc() {
        if(User != null && User.email != ''){
            var chat = document.querySelector('#NotePadChatBox')
            chat.value = ''
            requestWsStream('SubmitNoteChat',null,null)
        }else{
            toast('invalid User email',{
                type : 'warning',
                theme : Theme,
                position : "top-right"
            })
    
    }
    }
    function CloseNoteChat(props) {
        SetNotePadComponents((e) => {
            return {
            ...e,
            'addNote' : false,
            'NoteList' : true,
            'ShowNoteChatLog' : false
            }
        })    
        requestWsStream('NotePadlogs')
    }
    useEffect(() => {
        if(NoteChatLogContainer.current){
        var Log = NoteChatLogContainer.current
        Log.scrollTo({
            'top' : Log.scrollHeight ,
            'behavior' : 'smooth',
        })
        }

    },[NoteChatLog])
    const NotePadlogsMapper = NotePadlogs.map((items,i) => {

        return (
            <div  key={i} className=" cursor-pointer hover:shadow-md hover:shadow-purple-700 rounded-sm border-[1px] border-gray-400 px-3 text-slate-100 flex flex-col w-full gap-1 text-left  tooltip-info tooltip tooltip-top" data-tip="Open">
                <div className=" flex flex-row justify-between px-1 align-middle w-full">
                    <big onClick={() => OpenNoteChat(i,items.title)} className=" w-full" >{i + 1}{`)`} {items.title}</big>
                    <RiDeleteBinLine className=' text-red-600 text-lg hover:text-amber-500 rounded-full bg-transparent cursor-pointer my-auto' onClick={() => requestWsStream('NotePadlogsDelete',null,items.title)} />
                </div>
                <div onClick={() => OpenNoteChat(i,items.title)} className=" px-3 flex flex-row justify-between w-full">
                    <input className=" cursor-pointer text-ellipsis max-w-[60%] align-middle my-auto bg-transparent text-gray-500 italic border-none "  readOnly value={items.LastText} type="text" />
                    <small className=" text-sm my-auto font-mono italic">{items.DateCreated}</small>
                </div>
            </div>
        )
    })

    const NotePadChatLogMapper = NoteChatLog.map((items,i) => {

        return (
            <div  key={i} className={`bg-transparent flex px-2 min-w-fit w-[90%] bg-opacity-90 my-1 mx-2 rounded-sm  mr-auto  flex-col gap-1`}>
                <div className={` p-3 rounded-md min-w-fit  shadow-md  bg-slate-900 dark:text-slate-900 dark:bg-slate-800 shadow-slate-300 text-slate-100 flex-col  gap-2 w-full flex `}>
                                        
                    <blockquote className={` max-w-[250px] break-words text-slate-100  font-mono text-sm `} >{items.text}</blockquote>
                    <div className={` flex-row justify-end gap-2 sm:gap-3 md:gap-4 w-full flex `}>
                        <small className={`  italic font-semibold font-mono w-full text-right dark:text-cyan-500 pr-3' `}>{items.time}</small>                       
                    </div>                    
                </div>
            </div>
        )
    })
    
    return(
        <div className={` w-full md:h-screen h-full ${Theme}`}>
            <div className=" overflow-visible w-full dark:bg-slate-900 bg-slate-200 h-full  min-h-screen">
                <div className="  top-0  w-full z-50 bg-transparent  border-slate-900">
                    <Navbar />
                </div>   
                <div className={` ${ShowEmoji ? 'flex' : ' hidden'} justify-center absolute z-50 top-[80%] sm:top-[78%]  lg:top-[40%] lg:translate-x-[350px] md:top-[38%] sm:left-5`}>
                </div>
                {/* top tools */}
                <div className=" mb-[1px] shadow-md shadow-orange-800 transition-all duration-700 dark:shadow-sky-500 dark:bg-slate-800 bg-slate-100 flex flex-row w-full justify-around">
                    <div className=" w-fit flex py-2 flex-row">
                            <LiaSearchengin title="Search" onClick={SearchFunc} className={` cursor-pointer w-fit hover:ring-0  hover:text-pink-500 ${!ShowSearch ? ' opacity-100' : ' opacity-100'} transition-all duration-500 text-2xl my-auto text-orange-500 translate-x-6 z-40`}/>
                            <input 
                            name="searchVal"
                            className="   bg-slate-800 text-slate-200 dark:text-slate-800 dark:ring-1 dark:bg-slate-200  placeholder:text-slate-400 placeholder:font-semibold pl-6 text-center max-w-[100px] sm:max-w-[200px] outline-none text-ellipsis transition-all duration-500 hover:ring-transparent border-[1px] hover:border-slate-800 z-30 m-auto ring-2 w-fit "
                            placeholder={` Search`}
                            onMouseEnter={() => SetShowSearch(false)}
                            onMouseLeave={() => SetShowSearch(true)}
                            type="text" />

                    </div>
                    <div className=" z-40 flex flex-row py-2 align-middle">
                                <span className=" flex flex-row gap-1 align-middle text-slate-800 dark:text-slate-100">
                                <span onClick={() => SetTheme(Theme == 'light' ? 'dark' : 'light')} className=' overflow-hidden cursor-pointer hover:underline-offset-2  hover:dark:text-amber-500 hover:text-blue-600 flex flex-row gap-2 font-semibold align-middle m-auto justify-around text-center dark:text-slate-100'>Theme:
                                    <p onClick={() => SetTheme(Theme == 'light' ? 'dark' : 'light')} className=' w-fit m-auto'>{Theme == 'light' ? <GiMoonClaws className=' my-auto w-fit animate-pulse mx-auto text-base text-center cursor-pointer hover:animate-spin' onClick={() => SetTheme('dark')}/>  : 
                                    <RxSun className='  my-auto w-fit text-base text-center animate-pulse mx-auto cursor-pointer hover:animate-spin '  onClick={() => SetTheme('light')} />}</p> 
                                </span>
                                </span>
                    </div>

                </div>             


                <div className= {`  ml-0 mt-10   top-auto flex bottom-10 `}>
                    <div className=" min-h-[500px] mb-2 shadow-md shadow-slate-100 mx-auto  xs:ml-2 sm:ml-[20%] w-fit min-w-[250px] sm:min-w-[400px] flex flex-col justify-between gap-1 bg-slate-800 text-slate-100">
                        {/* header */}
                        <div className= {` ${NotePadComponents.ShowNoteChatLog ? ' border-none' : 'border-b-[1px] border-b-slate-300 ' }py-2  flex flex-row w-full justify-around `}>
                            <IoMdAdd onClick={() => AddNoteFunc('show')} className= {` ${NotePadComponents.ShowNoteChatLog || NotePadComponents.addNote  ? ' hidden' : ' flex' } cursor-pointer  my-auto hover:text-amber-500 text-2xl `} />
                            <GoArrowLeft   onClick={CloseNoteChat} data-tip="Close" className= {` tooltip tooltip-error ${!NotePadComponents.ShowNoteChatLog && !NotePadComponents.addNote ? ' hidden' : ' flex' } cursor-pointer  my-auto hover:text-amber-500 text-2xl `} />
                            <big className=" font-semibold my-auto">NotePad</big>
                            <IoMdClose onClick={() => SetShowNotePad(false)} className="cursor-pointer my-auto text-red-600 hover:text-purple-500 text-2xl" />
                        </div>
                        <big className={` ${NotePadComponents.ShowNoteChatLog ? ' flex w-full text-center justify-center align-middle mb-auto border-b-[1px] border-b-slate-300 py-1 font-semibold' : ' hidden'}  `} >{NotePadComponents.SelectedTitle}</big>
                        <div className={` h-fit max-h-[200px] mb-auto pr-3 pl-1 ${NotePadComponents.NoteList ? 'flex flex-col w-full justify-start whitespace-nowrap overflow-y-auto pb-3 gap-2' : ' hidden' } `}>
                            {NotePadlogsMapper}
                        </div>
                        <div ref={NoteChatLogContainer} className={` max-h-[400px] ${NotePadComponents.ShowNoteChatLog ? ' justify-start overflow-auto h-[85%] gap-2 flex flex-col' : ' hidden'} `}>
                            {NotePadChatLogMapper}
                        </div>
                        <div className= {` ${ NotePadComponents.addNote ? 'flex flex-col' : ' hidden'} w-[80%] m-auto  `}>
                            <input onChange={Addnote} name="NewNoteTitle" className=" text-ellipsis rounded-sm ring-1 ring-sky-700 bg-transparent placeholder:text-slate-300 placeholder:font-semibold" placeholder="Title" type="text" />
                            <button onClick={() => AddNoteFunc('Add')} className=" hover:shadow-md hover:shadow-slate-200 p-2 rounded-sm bg-transparent hover:text-amber-500 transition-all duration-500 min-w-[80px] mx-auto w-fit my-3 ring-1 ring-sky-700" >Add</button>
                        </div>
                        <div className= {` border-t-[1px] border-t-gray-400 py-2 pb-2 h-[15%] min-h-fit  ${NotePadComponents.ShowNoteChatLog ?'flex flex-row justify-between' : ' hidden'} px-3 w-full `}>
                            <textarea  onChange={Addnote} className=" break-words text-left rounded-sm outline-none bg-transparent ring-1 ring-sky-700 min-w-[80%] min-h-[50px] max-h-[80px] placeholder:text-gray-400" placeholder="Text goes here..." name="chatMessage" id="NotePadChatBox"></textarea>
                            <IoSendSharp onClick={SubmitNoteChatFunc} title="send" className=" hover:text-xl text-purple-700 hover:text-yellow-400 duration-300 transition-all cursor-pointer text-lg  my-auto"/>
                        </div>
                    </div>
                </div>                

            </div>
        </div>
    )


};

const mapStateToProps =  state => ({
    isAuthenticated:state.chatReducer.isAuthenticated
})    


export default connect(mapStateToProps,{load_user, logout,CheckAuthenticated})(Chat);