import express from 'express';
import multer from 'multer';
import path from 'path';

import { client, io } from './main';
import { isChatroomAdmin, isChatroomMember } from './guards';

export const chatroomRoutes = express.Router();

//  Configuring multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads", "chatroom-icons"));    
    },
    filename: (req, file, cb) => {
        //  upload name = `Island-chatroomicon--timestamp.${format}`
        req.body['chatroom-icon'] = (`Island-chatroomicon-${Date.now()}.${file.mimetype.split('/')[1]}`);
        cb(null, `Island-chatroomicon-${Date.now()}.${file.mimetype.split('/')[1]}`);
    }
})
const upload = multer({storage});


//  Retrieving chatroom info
chatroomRoutes.get('/chatroom/id/:id', async (req, res) => {
    let selectedFields = 'a.id, a.creator_id, a.name, a.description, a.privacy, a.chatroom_icon, a.created_at, a.last_active_at, a.sticky_id, b.content AS sticky_content, b.check_in AS sticky_check_in, b.created_at AS sticky_created_at'
    
    //  Retrieving basic chatroom information and member data
    let queryRes = (await client.query('(SELECT ' + selectedFields + ' FROM chatroom AS a LEFT JOIN sticky_message AS b ON a.sticky_id = b.id WHERE a.id=$1)', [
        parseInt(req.params.id)])).rows[0];
    queryRes['chatroomMembers'] = (await client.query('SELECT b.nickname, b.islander_icon, a.member_id, a.member_role AS role, a.member_joined_at AS joined FROM chatroom_membership a LEFT JOIN islander b ON a.member_id = b.id WHERE a.chatroom_id=$1', [
        parseInt(req.params.id)])).rows;
    
    //  Retrieving chatroom tags
    let chatroomInterestsSubquery = ' (SELECT b.interest_id FROM chatroom a LEFT JOIN chatroom_interest b ON a.id = b.chatroom_id WHERE a.id=$1) AS sub ';
    queryRes['chatroomInterests'] = [];
    let chatroomInterests = (await client.query('SELECT sub.interest_id AS id FROM' + chatroomInterestsSubquery + 'INNER JOIN interest c ON sub.interest_id = c.id', [
        parseInt(req.params.id)])).rows;
    for (let row of chatroomInterests) {
        queryRes['chatroomInterests'].push(row.id);
    }

    //  Retrieving chatroom sticky
    if (queryRes['sticky_check_in'] == "daily") {
        queryRes['sticky_daily_checkins'] = (await client.query('SELECT member_id, checked_in_at FROM sticky_check_in WHERE sticky_id = $1 AND checked_in_at >= CURRENT_DATE', [
            queryRes['sticky_id']    
        ])).rows
    }

    //  Sending client a full list of possible tags for their reference
    queryRes['allInterests'] = (await client.query('SELECT * FROM interest')).rows;
    res.json(queryRes);
})


//  Creating new chatroom
chatroomRoutes.post('/chatroom', upload.single('image-upload'), async (req, res) => {
    if (req.session) {
        let queryParams = {
            "creator-id": req.session['user'],
            "name": req.body['chatroom-name'],
            "description": req.body['chatroom-description'],
            "privacy": req.body['chatroom-privacy'],
            "chatroom-icon": req.body['chatroom-icon']
        }
        let newRoomID = (await client.query('INSERT INTO chatroom (creator_id, name, description, privacy, chatroom_icon, created_at, last_active_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id', [
            queryParams["creator-id"], 
            queryParams["name"], 
            queryParams['description'], 
            queryParams['privacy'], 
            queryParams['chatroom-icon']])).rows[0].id;
        try {
            await client.query("INSERT INTO chatroom_membership (member_id, chatroom_id, member_role, member_joined_at) VALUES ($1, $2, 'admin', NOW())",[
                req.session['user'],
                newRoomID])
            
            if (req.body['chatroom-interest']){
                if (req.body['chatroom-interest'] instanceof Array)  {
                    for (let tag of req.body['chatroom-interest']) {    
                        await client.query("INSERT INTO chatroom_interest (chatroom_id, interest_id) VALUES ($1, (SELECT id FROM interest WHERE name LIKE $2))", [
                            newRoomID,
                            tag])
                    }        
                } else {
                    await client.query("INSERT INTO chatroom_interest (chatroom_id, interest_id) VALUES ($1, (SELECT id FROM interest WHERE name LIKE $2))", [
                        newRoomID,
                        req.body['chatroom-interest']])
                }
            }
            await client.query("INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4)", [
                newRoomID,
                0,
                JSON.stringify({
                    "creator-id": req.session['user'],
                }),
                "msg-system-group-creation"]) //[code review] use enum for message types
            io.to(`user-${req.session['user']}`).emit('new-room'); //[code review] join room logic? do it here or leave a comment
            res.json({
                "message": 'Chatroom created successfully',
                "success": true
            });
        } catch (e) {
            console.log(e)
            res.json({
                "message": 'Something went wrong! Please try again',
                "success": false}
            )
        }
    }
})


chatroomRoutes.post('/chatroom/sticky/:room', isChatroomAdmin, async (req, res) => {
    if (req.body['hasAdminRights']) { // [code review] dun modify req.body! add another req.xxx with @types
        try {
            let newStickyId = (await client.query('INSERT INTO sticky_message (chatroom_id, content, check_in, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id', [
                req.params.room, 
                req.body.content,
                req.body.check_in
            ])).rows[0].id
            await client.query('UPDATE chatroom SET sticky_id = $1 WHERE id = $2', [
                newStickyId,
                req.params.room
            ])

            let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                parseInt(req.params.room), 
                0,
                JSON.stringify({
                    "initiator-id": req.session['user'],
                    "update": ` added a new sticky: "${req.body.content}"`
                }),
                "msg-system-group-info-change"
            ])).rows[0].id;

            io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            })
            await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                parseInt(req.params.room)
            ])
            res.json('sticky message updated successfully!')
        } catch (e) {
            console.log(e)
            res.json('error creating sticky')
        }
    } else {
        res.json('you must be an admin of this Island to update its info!')
    }
})

chatroomRoutes.post('/chatroom/sticky/checkin/:room', isChatroomMember, async (req, res) => {
    if (req.body['isChatroomMember']) {
        try {
            await client.query('INSERT INTO sticky_check_in (sticky_id, member_id, checked_in_at) VALUES ($1, $2, NOW())', [
                req.body['linked-content-id'],
                req.session['user']
            ])
            let queryBody = 'INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type, linked_content_id) VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING id'
            let queryParams = [
                parseInt(req.params.room),
                req.session['user'],
                req.body.content,
                'msg-daily-checkin',
                parseInt(req.body['linked-content-id'])
            ]
            let messageID = (await client.query(queryBody, queryParams)).rows[0].id;
            
            io.to(`room-${req.params.room}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            });
            await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                parseInt(req.params.room)
            ])
        } catch (e) {
            console.log(e);
            res.json("Something went wrong")
        }
    } else {
        res.json('You do not belong to this group.')
    }
})

//  Editing chatroom info
chatroomRoutes.put('/chatroom/:room', upload.single('image-upload'), isChatroomAdmin, async (req, res) => {
    if (req.body['chatroom-icon']) { //[code review] leave a comment here to explain why an admin wont have chatroom-icon
        await client.query('UPDATE chatroom SET chatroom_icon=$1 WHERE id=$2', [
            req.body['chatroom-icon'],
            parseInt(req.params.room)])
        await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4)', [
            parseInt(req.params.room), 
            0,
            JSON.stringify({
                "initiator-id": req.session['user']
            }),
            "msg-system-group-icon-change" 
        ])
        io.to(`room-${parseInt(req.params.room)}`).emit('new-message', parseInt(req.params.room))
        await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
            parseInt(req.params.room)
        ])
        res.json('Island info updated!')
    } else if (req.body['hasAdminRights']) {
        if (req.body.name.length > 30) {
            res.json('Island name must be 30 characters or below')
        } else {
            try {
                let oldInfo = (await client.query('SELECT name, description, privacy FROM chatroom WHERE id = $1', [
                    parseInt(req.params.room)])).rows[0];
                let infoChanged = {
                    "name": oldInfo.name != req.body.name,
                    "description": oldInfo.description != req.body.description,
                    "privacy": oldInfo.privacy != req.body.privacy
                }
                await client.query(`UPDATE chatroom SET name=$1, description=$2, privacy=$3 WHERE id=$4`,[
                    req.body.name,
                    req.body.description,
                    req.body.privacy,
                    parseInt(req.params.room)
                ])
                let oldChatroomInterests = (await client.query('SELECT interest_id AS id FROM chatroom_interest WHERE chatroom_id=$1', [
                    parseInt(req.params.room)])).rows;
                for (let interest of oldChatroomInterests) {
                    if (req.body.interests.indexOf(interest.id) < 0 && req.body.interests.indexOf(interest.id + "") < 0) {
                        await client.query('DELETE FROM chatroom_interest WHERE chatroom_id=$1 AND interest_id=$2', [
                            parseInt(req.params.room), 
                            parseInt(interest.id)])
                    }
                }
                for (let interest of req.body.interests) {
                    if ((await client.query('SELECT * FROM chatroom_interest WHERE chatroom_id=$1 AND interest_id=$2', [
                        parseInt(req.params.room), 
                        parseInt(interest)])).rows.length == 0) {
                            await client.query(`INSERT INTO chatroom_interest (chatroom_id, interest_id) VALUES ($1, $2)`, [
                                parseInt(req.params.room), 
                                parseInt(interest)])
                        }
                }
                if (infoChanged.name) {
                    let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                        parseInt(req.params.room), 
                        0,
                        JSON.stringify({
                            "initiator-id": req.session['user'],
                            "update": ` renamed the Island to ${req.body.name}`
                        }),
                        "msg-system-group-info-change"
                    ])).rows[0].id
                    io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                        'roomID': parseInt(req.params.room),
                        'msgID': messageID
                    })
                    await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                        parseInt(req.params.room)
                    ])
                } 
                if (infoChanged.description) {
                    let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                        parseInt(req.params.room), 
                        0,
                        JSON.stringify({
                            "initiator-id": req.session['user'],
                            "update": ` changed the Island description`
                        }),
                        "msg-system-group-info-change"
                    ])).rows[0].id
                    io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                        'roomID': parseInt(req.params.room),
                        'msgID': messageID
                    })
                    await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                        parseInt(req.params.room)
                    ])
                } 
                if (infoChanged.privacy) {
                    let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                        parseInt(req.params.room), 
                        0,
                        JSON.stringify({
                            "initiator-id": req.session['user'],
                            "update": ` changed the Island privacy from ${oldInfo.privacy} to ${req.body.privacy}`
                        }),
                        "msg-system-group-info-change"
                    ])).rows[0].id
                    io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                        'roomID': parseInt(req.params.room),
                        'msgID': messageID
                    })
                    await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                        parseInt(req.params.room)
                    ])
                }
            } catch (e) {
                console.log(e);
            }
            res.json('Island info updated!')
        }
    } else {
        res.json('you must be an admin of this Island to update its info!')
    }
})


/*chatroomRoutes.delete('/chatroom/:room', isChatroomAdmin, async (req, res) => {
    if (req.body['hasAdminRights']) {
        await client.query('DELETE FROM chatroom')
        chatroom, chatroom_event, chatroom_interest, chatroom_membership, event, join_chatroom_token, message, message_attachment, sticky_check_in, sticky_message
    }
})*/