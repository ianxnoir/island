import express from 'express'

import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()
import { client } from './main'



const nodemailer = require('nodemailer')


// const uuidv1 = require('uuid/v1')
require("dotenv").config()

export const resetpwRoutes = express.Router();
// const SALT = 10;

function sendResetLink(email: any, id: any, nickname: any) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'ianhc.gwxa@gmail.com',
            clientId: process.env.GOOGLE_CLIENT_EMAIL_ID,
            clientSecret: process.env.GOOGLE_CLIENT_EMAIL_SECRET,
            refreshToken: process.env.GOOGLE_CLIENT_EMAIL_REFRESH,
            accessToken: process.env.GOOGLE_CLIENT_EMAIL_ACCESS_TOKEN
        },
    });


    var mailOptions = {
        from: 'ianhc.gwxa@gmail.com',
        to: `${email}`,
        subject: `Let's reset your password, ${nickname}.`,
        html: `<h1>Hello!</h1>
        <p>You are receiving this email because we received a password reset request for your account.</p>
        To reset your password, please click on this link: http://localhost:8080/resetPassword/?id=${id}
        <p> If you did not request a password reset, no further action is required.

        <p> Regards,<br>Ian</p> `




    }

    transporter.sendMail(mailOptions, function (err: any, data: any) {
        if (err) {
            console.log('Error Occurs', err)
        } else {
            console.log('Email sent!!')
        }
    })

}



resetpwRoutes.post("/forget", async (req, res) => {
    const user = (await client.query(`SELECT * FROM islander WHERE email=$1`, [req.body.email])).rows[0];

    if (req.body.email != user.email) {
        return res.status(401).redirect('/forgetpw.html?error=Email+Has+Not+Registered')
    } else {
        if (req.session) {
            req.session['user'] = user.id
        }
        console.log("sending")
        sendResetLink(user.email, user.id, user.nickname)
        console.log("sent!!!")
        return res.json({ result: true })

    }


})


resetpwRoutes.get("/resetPassword", async (req, res) => {
    let id = req.query.id
    console.log(id)
    req.session['userid']=id
    res.redirect('/resetPassword.html')

})
resetpwRoutes.post("/reset", async (req, res) => {
    let id = req.session['userid']
    const user = (await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows[0];
    console.log(user)
    // const match = await bcrypt.compare(req.body.oldPassword, user.password);
    // if (match) {
        if (req.body.password != req.body.confirmPassword) {
            res.status(401).redirect('/resetPassword.html?error=Passwords+must+match')
        } 

        
        else {
            console.log('test')
            if (req.session) {
                req.session['user'] = user.id
            }
            console.log('Going to reset..')

            bcrypt.hash(req.body.password, 10).then(async hashed => {

                console.log('Going to reset..')
                await client.query(`UPDATE islander SET password = $1 WHERE email=$2`, [hashed, user.email])

                console.log("reset!!")

                return res.json({ result: true })
                
            })

        }
    // }
    // else{
    //     res.status(401).redirect('/resetPassword.html?error=Your+Old+Password+Is+Not+Correct')
    // }

})




