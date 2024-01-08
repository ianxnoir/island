import express from 'express';
//  import path from 'path';
//  import multer from 'multer';
//  import fs from 'fs';

import { client, io } from './main';
//  import { isChatroomAdmin, isChatroomMember } from './guards';

export const personalChatroomRoutes = express.Router();


personalChatroomRoutes.post('/chatroom/personal/:islander', async (req, res) => {
    let personalChannelQuery = (await client.query('SELECT * FROM personal_chatroom WHERE (member_a_id = $1 OR member_b_id = $1) AND (member_a_id = $2 OR member_b_id = $2)', [
        req.session['user'],
        parseInt(req.params.islander)
    ])).rows
    if (personalChannelQuery.length > 0) {
        res.json({
            'redirect': true,
            'location': `island.html?room=${personalChannelQuery[0].chatroom_id}`
        })
    } else {
        try {
            let newRoomID = (await client.query("INSERT INTO chatroom (creator_id, name, privacy, created_at, last_active_at) VALUES ($1, 'Personal Conversation', 'personal', NOW(), NOW() ) RETURNING id", [
                req.session['user'],
            ])).rows[0].id
            await client.query('INSERT INTO personal_chatroom (chatroom_id, member_a_id, member_b_id) VALUES ($1, $2, $3)', [
                newRoomID,
                req.session['user'],
                parseInt(req.params.islander)
            ])
            await client.query('INSERT INTO chatroom_membership (chatroom_id, member_id, member_joined_at) VALUES ($1, $2, NOW()), ($1, $3, NOW())', [
                newRoomID,
                req.session['user'],
                parseInt(req.params.islander)            
            ])
            await client.query("INSERT INTO message (chatroom_id, sender_id, time_sent, message_type) VALUES ($1, $2, NOW(), $3)", [
                newRoomID,
                0,
                "msg-system-new-personal-chatroom"])
            io.to(`user-${parseInt(req.params.islander)}`).emit('new-room');
            res.json({
                'redirect': true,
                'location': `island.html?room=${newRoomID}`
            })
        } catch(e) {
            console.log(e)
            res.json("Something went wrong.")
        }
    }
})
