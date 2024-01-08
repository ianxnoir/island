import express from 'express';
import expressSession from 'express-session';
import http from 'http';
import { Server as SocketIO } from 'socket.io';

import dotenv from 'dotenv';
import { Client } from 'pg';

import bodyParser from 'body-parser';

import fetch from 'node-fetch'
import {google} from './google'

//  Routers
import { chatroomRoutes } from './chatroomRoutes';
import { personalChatroomRoutes } from './personalChatroomRoutes';
import { messageRoutes } from './messageRoutes';
import { loginRoutes } from './loginRoutes';
import { homepageRoutes } from './homepageRoutes';
import { resetpwRoutes} from './resetpwRoutes';
import { selectIconRoutes} from './selectIcon'
import { eventRoutes } from './eventRoutes';
import { userProfileRoutes } from './userProfile'
import { memberRoutes } from './memberRoutes';

// import {googleRoutes} from './googleRoutes'

//  Guard middleware
import { isLoggedIn } from './guards';

const PORT = 8080;
const app = express();
const server = new http.Server(app);
export const io = new SocketIO(server);

// For testing
// app.use((req,res,next) => {
//     console.log(req.ip)
//     console.log(req.path)
//     next()
// });

//  Reading .env file and gaining access to database
dotenv.config();
export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

//  Passing all form requests through bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//  Session middleware and socket init logic
const sessionMiddleware = expressSession({
    secret: 'Open your Island Messaging account today!',
    resave: true,
    saveUninitialized: true
});

// //  Passing all socket requests through session middleware immediately
io.use((socket, next)=>{
    const request = socket.request as express.Request;
    sessionMiddleware(request, request.res as express.Response, next as express.NextFunction);
});

app.use(sessionMiddleware);

app.use(google.getMediator());
app.get('/login/google', async (req, res) => {
    const accessToken = req.session?.['grant'].response.access_token;
    const fetchRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
    let json = await fetchRes.json();

    
    
    console.log(json)
    if (json.verified_email) {
        let users = (await getUsers(json.email))
        if (users.length < 1) {
            users = await addUser(json.given_name, json.name, json.email)
            //users = (await getUsers(json.email))
        }
        const user = users[0];
        if (!user) {
            return res.status(401).redirect('/index.html?error=no_such_user')
        }
        if (req.session) {
            req.session['user'] = user.id
            req.session['nickname'] = user.nickname;
            req.session['joined-at'] = user['joined_at'].toISOString();
            console.log("return to home")

        }
    }
    res.redirect('/homepage.html');
})




async function addUser(given_name: string, name:string, email:string) {
    let query: string;
  
    query =
    'INSERT INTO islander (nickname, username, email, joined_at) VALUES ($1, $2, $3, NOW()) RETURNING id, nickname, joined_at';
    const result = await client.query(query, [given_name,
        name, email]);
    return result.rows;
}
async function getUsers(email: string) {
    let query: string;
    query = `SELECT * FROM islander WHERE email = $1`;
    return (await client.query(query, [email])).rows;
}




//  When user connects, join all rooms
io.on('connect', async (socket) => {
    console.log('New socket connection established.');
    if(socket.request.session['user']){
        console.log("Querying database for list of user's chatrooms.");
        joinAllRooms(socket)
    }

    socket.on('join-new-rooms', async() => {
        if(socket.request.session['user']){
            console.log("Querying database for list of user's chatrooms.");
            joinAllRooms(socket)
        }
    })

    /*
    socket.on('join-video-call', (roomID) => {
        console.log(`User ${socket.request.session['user']} has joined a video call at room ${roomID}`)
        io.to(`room-${roomID}`).emit('new-video-caller', socket.request.session['user'])
    })
    
    socket.on('send-stream-to-new-caller', (callInfo) => {
        console.log(`User ${socket.request.session['user']} is sending a video stream to user ${callInfo.to}`)
        io.to(`user-${callInfo.to}`).emit('send-stream-to-new-caller', callInfo)
    })*/
})

async function joinAllRooms(socket) {
    let userRooms = (await client.query('SELECT chatroom_id FROM chatroom_membership WHERE member_id=$1', 
        [socket.request.session['user']])).rows

    console.log("Room list found. Joining rooms");
    if(userRooms) {
        for (let room of userRooms) {
            socket.join(`room-${room['chatroom_id']}`);
        }
    }
    socket.join(`user-${socket.request.session['user']}`);
}

/*io.on('disconnect', async (socket) => {
    if (socket.request.session) {
        if (io.sockets.clients(`user-${socket.request.session['user']}`).length == 0)
        console.log(`user ${socket.request.session['user']} has disconnected`)
    }
})*/




// //  Distributing public static files
app.use(express.static('./public'));

//  Login-related requests will be handled in loginRoutes.ts
app.use('/', loginRoutes);

app.use(express.static('./public/assets'))
app.use(express.static('./public/assets/icons'))

//  All content from this point may only be accessed once the user has logged in
app.use('/', isLoggedIn);

app.use(express.static('./public/protected'));
app.use(express.static('./public/chatroom'));
app.use(express.static('./public/group-list'));
app.use(express.static('./public/chatroom-invite'))

app.use(express.static('./uploads/chatroom-icons'))
app.use('/uploadedIcon', express.static('./uploads/user-icons'))
app.use(express.static('./public/assets/usericon'))


//  Chatroom-related requests will be handled in chatroomRoutes.ts
app.use('/', chatroomRoutes);

//  Requests related to joining/leaving groups will be handled in memberRoutes.ts
app.use('/', memberRoutes);

//  Requests related to the creation and management of direct message channels will be handled in directMessageRoutes.ts
app.use('/', personalChatroomRoutes);

//  Message-related requests will be handled in messageRoutes.ts
app.use('/', messageRoutes);

//  Event-related requests will be handled in eventRoutes.ts
app.use('/', eventRoutes);

//  Homepage-related requests will be handled in homepageRoutes.ts
app.use('/', homepageRoutes);

app.use('/', userProfileRoutes)

//

app.use('/', /*isInChatroom,*/ express.static('./uploads/shared-files'))

app.use('/', resetpwRoutes);

app.use('/', selectIconRoutes)


client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Now listening from port ${PORT}`);
        });
    });




