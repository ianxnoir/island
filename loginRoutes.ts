import express from 'express'

import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

import { client } from './main'


// import sendResetLink  from "/resetPassword";
//import e from 'express'

dotenv.config()

export const loginRoutes = express.Router();
const SALT = 10;


loginRoutes.post('/register', async (req, res) => {
  //  Check this on client-side if possible
  if (req.body.password != req.body.confirmPassword) {
    res.status(401).redirect('/index.html?error=Passwords+must+match')
  }
  let checkEmail = (await client.query('SELECT * FROM islander WHERE email = $1', [req.body.email])).rows
  if (checkEmail.length > 0) {
    return res.status(401).redirect('/index.html?error=Email+has+been+registered')
  }
  let checkUsername = (await client.query('SELECT * FROM islander WHERE username = $1', [req.body.username])).rows
  if (checkUsername.length > 0) {
    return res.status(401).redirect('/index.html?error=Nickname+has+been+used')
  }
  const newUser = (await client.query('INSERT INTO islander (nickname, username, password, email, joined_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, joined_at', [
    req.body.nickname,
    req.body.username,
    await bcrypt.hash(req.body.password, SALT),
    req.body.email])).rows[0];
    req.session['user'] = newUser.id;
    req.session['nickname'] = req.body.nickname;
    req.session['joined-at'] = newUser['joined_at'];
    console.log(req.session);
  res.redirect(`/selectIcon?id=${newUser.id}`);
})


loginRoutes.post('/login', async (req, res) => {
  // console.log(req.body)
  const user = (await client.query(`SELECT * FROM islander WHERE username=$1 OR email=$1`, [req.body.username])).rows[0]
  // console.log(user)
  if (user === undefined || !req.session) {
    console.log('no user found or no session found')
    res.status(401).json({
      result: false,
      error: "incorrect username"
    })
  } else {
    let match: boolean;
    // [code review] don't accept plain text password. use token instead
    if (req.body.password == user.password) {
      match = true;
    } else {
      match = await bcrypt.compare(req.body.password, user.password);
    } 
    
    if (match) {
      if (req.session) {
        // console.log("Session User")
        // console.log(user)
        // req.session['user']=user
        req.session['user'] = user.id;
        req.session['nickname'] = user.nickname;
        req.session['email']= user.email;
        req.session['username']= user.username;
        req.session['bio'] = user.bio;
        req.session['user.islander_icon']=user.islander_icon
        req.session['joined-at'] = user['joined_at'].toISOString();
        
        
        // To the protected page.
      }
      return res.json({result:true,
        token: user.password})
      // return res.redirect('/homepage.html')
    } else {
    
      return res.status(401).redirect('/index.html?error=Incorrect+Password')
    }
  }
})



// loginRoutes.post('/login', async (req, res) => {
//     console.log(req.body)
//     const users = (await client.query('SELECT * FROM islander WHERE username = $2', [
//       req.body.loginID
//     ])).rows;
//     if (users.length == 0 || req.session == null) {
//       res.json({result: false})
//     } else {
//       if (await bcrypt.compare(req.body.loginPassword, users[0].password)) {
//         req.session['user'] = users[0].id
//         res.json({result: true}) 
//         res.redirect('/public/homepage.html')
//       } else {
//         res.json({result: false})
//       }
//     }
//   })



loginRoutes.get('/currentUser', (req, res) => {
  if (req.session?.['user'] != null) {
    res.json({
      result: true,
      userId: req.session?.['user']
    })
  } else {
    res.json({ result: false })
  }
})

loginRoutes.get('/logout', async (req, res)=>{
  await req.session.destroy((e)=>{
    console.log(e);
  })
  res.redirect('index.html')
})



// async function logout(req:express.Request,res:express.Response){
//     if(req.session){
//         delete req.session?.['user'];
//     }
//     res.redirect('index.html');
// }


