

import express from 'express'

import { client} from './main'

import path from 'path';
import multer from 'multer';




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads", "user-icons"));
    },
    filename: (req, file, cb) => {
       req.body['user-icon']=`${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`
        cb(null, req.body['user-icon']);
    }
})
const upload = multer({ storage });

export const userProfileRoutes = express.Router();



// userProfileRoutes.get("/profile", async (req, res) => {
//     let id = req.query.id
//     const user = (await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows[0]
//     console.log(id)
//     req.session['userid'] = id
//     
//     return res.redirect('userProfile.html')

// })

// userProfileRoutes.post("/userProfile", async (req, res) => {
//     let id = req.session['userid']
//     const user = (await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows[0];
//     console.log(user)
//     if (req.session) {
//         req.session['user'] = user.id
//     }

//     console.log('Going to reset..')
//     if (req.body.bio = "" || edited) {
//         res.json({ result: true })
//         return
//     } else {
//         res.json({ result: false })
//         return
//     }




    // }
    // else{
    //     res.status(401).redirect('/resetPassword.html?error=Your+Old+Password+Is+Not+Correct')
    // }

// })
//                      userProfile.js readUser()
userProfileRoutes.post('/userInfo02', async (req, res) => {
    let currentUser = (await client.query('SELECT id, username, nickname, email, islander_icon, bio FROM islander where id = $1', 
  [req.session['user']])).rows[0]
    res.json(currentUser)
})

userProfileRoutes.put('/userIcon', upload.single('image-upload'), async (req, res) => {
    let id = req.session['user']

    console.log("id")
    console.log(id)
    console.log(req.body['user-icon'])
    if ((await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows.length > 0) {
       
        console.log(req.body['user-icon'])
        if (req.body['user-icon']) {
            await client.query('UPDATE islander SET islander_icon=$1 WHERE id=$2', 
            [req.body['user-icon'], id])
            req.session['user-icon']=req.body['user-icon']
            res.json({ result: true })

        } 

    }
})


userProfileRoutes.put('/userProfile', async (req, res) => {
    let id = req.session['user']
    console.log(id)
    if ((await client.query(`SELECT * FROM islander WHERE id=$1`, [id])).rows.length > 0) {

        // if (req.body['user-icon']) {
        //     await client.query('UPDATE islander SET islander_icon=$1 WHERE id=$2', [
        //         req.body['user-icon'], id])
            
        //     res.json({ result: true })

        // } 
           
            await client.query(`UPDATE islander SET username=$1, email=$2, nickname=$3, bio=$4 WHERE id = $5`, [
                req.body.username,
                req.body.email,
                req.body.nickname,
                req.body.bio,
                id
            ])
            

    
        // io.to(`id-${parseInt(id)}`).emit('new-edit')
        res.json({ result: true })
       
    }

})




// userProfileRoutes.put('/interestSelect/:choice', async (req, res) => {
//     let id = req.session['user']
//     console.log(id)
    
//     let userInterests = (await client.query('SELECT interest_id AS id FROM islander_interest WHERE islander_id=$1', [
//                 parseInt(id)])).rows;

//             for (let interest of userInterests) {
//                 if (req.body.interests.indexOf(interest.id) < 0 && req.body.interests.indexOf(interest.id + "") < 0) {
//                     await client.query('DELETE FROM islander_interest WHERE islander_id=$1 AND interest_id=$2', [
//                         parseInt(id),
//                         parseInt(interest.id)])
//                 }
//             }
//             for (let interest of req.body.interests) {
//                 if ((await client.query('SELECT * FROM islander_interest WHERE islander_id=$1 AND interest_id=$2', [
//                     parseInt(id),
//                     parseInt(interest.id)])).rows.length == 0) {
//                     await client.query(`INSERT INTO islander_interest (islander_id, interest_id) VALUES ($1, $2)`, [
//                         parseInt(id),
//                         parseInt(interest.id)])
//                 }
//             }
    
//     res.json({ result: true })


// })




