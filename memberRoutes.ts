import express from 'express';
import bcrypt from 'bcryptjs';

import { client, io } from './main';
import { isChatroomAdmin } from './guards';


const SALT = 5;

//  const LANIP = "192.168.59.135";
//  ^^^ To be replaced with actual domain name post-deployment

export const memberRoutes = express.Router();



//  Joining chatroom with link
memberRoutes.get('/checktoken/:room/:token', async (req, res) => {
    let userRoomQuery = (await client.query('SELECT * FROM chatroom_membership WHERE member_id = $1 AND chatroom_id = $2', [
        req.session['user'],
        parseInt(req.params.room)])).rows
    if (userRoomQuery.length > 0) {
        res.json({
            "tokenValidity": null,
            "redirect": true
        })
    } else {
        let tokenQuery = (await client.query('SELECT * FROM join_chatroom_token WHERE chatroom_id = $1 AND chatroom_token = $2', [
            parseInt(req.params.room),
            req.params.token])).rows
        if (tokenQuery.length > 0) {
            await client.query('INSERT INTO chatroom_membership (member_id, chatroom_id, member_joined_at) VALUES ($1, $2, NOW())', [
                req.session['user'],
                parseInt(req.params.room)
            ])
            let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                parseInt(req.params.room), 
                0,
                JSON.stringify({
                    "new-member-id": req.session['user']
                }),
                "msg-system-member-joined"
            ])).rows[0].id
            io.to(`room-${req.params.room}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            });
            await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                parseInt(req.params.room)
            ])
            //  Redirect user to a join_island.html page showing chatroom info card, with the option to join.
            res.json({
                "tokenValidity": true,
                "redirect": true
            })
        } else {
            //  Looks like you've entered an invalid invite link
            res.json({
                "tokenValidity": false
            })
        }
    }
})

//  Requesting join link from server
memberRoutes.get('/invite/room/:room', async (req, res) => {
    let token = (await bcrypt.hash(req.params.room + req.session['user'], SALT)).substring(12, 16);
    //          vvvvvvvvvvvvvvv [code review] put it in process.env
    let link = "localhost:8080/joinisland.html?room=" + encodeURIComponent(req.params.room) + "&token=" + encodeURIComponent(token)
    await client.query('INSERT INTO join_chatroom_token (chatroom_id, chatroom_token, created_at) VALUES ($1, $2, NOW())', [
        parseInt(req.params.room),
        token])
    res.json(link)
})

//  Changing things about members (admin role etc.)
memberRoutes.put('/member/:room/:member', isChatroomAdmin, async (req, res) => {
    if (req.body['hasAdminRights']) {
        try {
            switch (req.body['action']) {
                case 'makeAdmin':
                    await client.query("UPDATE chatroom_membership SET member_role = 'admin' WHERE chatroom_id = $1 AND member_id = $2", [
                        parseInt(req.params.room),
                        parseInt(req.params.member)
                    ])
                    let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                        parseInt(req.params.room), 
                        0,
                        JSON.stringify({
                            "member-id": parseInt(req.params.member),
                            "update": " is now an admin." 
                        }),
                        "msg-system-member-role-change"
                    ])).rows[0].id
                    
                    io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                        'roomID': parseInt(req.params.room),
                        'msgID': messageID
                    })
                    await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                        parseInt(req.params.room)
                    ])

                    res.json('New admin created')
                    break;
            }
        } catch(e) {
            res.json('Something went wrong')
        }
    } else {
        res.json('You need to be an admin of this group to execute this action.')
    }
})


//  Removing/Kicking/Leaving
memberRoutes.delete('/member/:room/:member', isChatroomAdmin, async (req, res) => {
    let queryParams = [
        parseInt(req.params.member),
        parseInt(req.params.room)
    ];
    
    let membershipQuery = (await client.query('SELECT * FROM chatroom_membership WHERE member_id = $1 AND chatroom_id = $2', 
        queryParams)).rows
    if (membershipQuery.length == 0) {
        res.json("You're trying to remove someone who isn't part of the group!")        
    } else {
        if (req.params.member == req.session['user']) {
            await client.query("UPDATE chatroom_membership SET member_role='inactive' WHERE member_id = $1 AND chatroom_id = $2",
                queryParams)
            let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                parseInt(req.params.room), 
                0,
                JSON.stringify({
                    "member-id": req.session['user'],
                    "update": " has left the Island." 
                }),
                "msg-system-member-left"
            ])).rows[0].id
            
            io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            })
            await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                parseInt(req.params.room)
            ])
            
            res.json('Islander has left the group')
        } else if (req.body['hasAdminRights'] == true) {
            await client.query("UPDATE chatroom_membership SET member_role='inactive' WHERE member_id = $1 AND chatroom_id = $2",
                queryParams)
            let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                parseInt(req.params.room), 
                0,
                JSON.stringify({
                    "member-id": parseInt(req.params.member),
                    "update": " has been removed from the Island."
                }),
                "msg-system-member-left"
            ])).rows[0].id
            
            io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            })

            res.json('Islander removed from group')
        } else {
            res.json("You need admin rights to remove someone from a group.")
        }
    }
})
