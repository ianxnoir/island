import express from 'express'

import { client } from './main'

export const selectIconRoutes = express.Router();
// import { Server as SocketIO } from 'socket.io';
// import http from 'http';
// import expressSession from 'express-session';
// import bodyParser from 'body-parser'
// const app = express();

// const server = new http.Server(app);
// const io = new SocketIO(server);

// const sessionMiddleware = expressSession({
//     secret: 'Tecky Academy teaches typescript',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: false }
// });

selectIconRoutes.get("/selectIcon", async (req, res) => {
    let id = req.query.id
    console.log(id)
    req.session['userid'] = id
    res.redirect('selectIcon.html')
    return
    

})

// selectIconRoutes.post("/select", async (req, res) => {
//     let id = req.session['userid']
//     const user = (await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows[0];
//     console.log(user)

//     if (req.session) {
//         req.session['user'] = user.id
//     }
//     console.log('select..')

//     console.log('Going to reset..')
//     await client.query(`INSERT INTO islander(islander_icon) VALUES ($1) RETURNING id`, [req.body.icon])

//     console.log("Selected!!")
//     req.session['icon'] = req.body.icon;
//     return res.json({ result: true })
// })


// const server = new http.Server(app);
// const io = new SocketIO(server);


// const sessionMiddleware = expressSession({
//     secret: 'Iconsssss',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: false }
// });


// app.use(sessionMiddleware);
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// io.use((socket, next) => {
//     const request = socket.request as express.Request;
//     sessionMiddleware(request, request.res as express.Response, next as express.NextFunction);
// });



selectIconRoutes.put('/icon/:id', async (req, res) => {
    let userid = req.session['user']
    
    const user = (await client.query(`SELECT * FROM islander WHERE id=$1`, [userid])).rows[0];
    
    let imageName = ''
    if(req.params.id== "0"){
        imageName="business-man.png"
    }else if(req.params.id== "1"){
        imageName="designer.png"
    }else if(req.params.id== "2"){
        imageName="detective.png"
    }else if(req.params.id== "3"){
        imageName="scientist.png"
    }else if(req.params.id== "4"){
        imageName="ninja.png"
    }
    const newIcon = await pushIcon(imageName, user.email)
    req.session['user-icon'] = newIcon?.['islander_icon'];
    // io.emit('icon-selected')
    return res.json({ result: true })
    
  
//    res.redirect(`/profile/?id=${user.id}`)
})

async function pushIcon(icon:string, email:string) {
    let query =
    `UPDATE islander SET islander_icon = $1 WHERE email=$2 RETURNING id, islander_icon`
    client.query(query, [icon,email]);
}



