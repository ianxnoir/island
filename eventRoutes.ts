import express from 'express';
import { client, io } from './main';
import { isChatroomMember } from './guards'
//  import path from 'path';



export const eventRoutes = express.Router();


eventRoutes.get('/event/id/:id', async (req, res) => {
    let events = (await client.query("SELECT b.id, b.name, b.starting_datetime, b.description FROM chatroom_event a INNER JOIN event b ON a.event_id = b.id WHERE a.chatroom_id = $1", [
        req.params.id])).rows
    res.json({
        "success": true,
        "events": events
    });
})

eventRoutes.post('/event', async (req, res) => {
    try {
        let newEventID = (await client.query("INSERT INTO event (name, starting_datetime, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id", [
            req.body.name,
            req.body.datetime,
            req.body.description])).rows[0].id
        await client.query("INSERT INTO chatroom_event (chatroom_id, event_id) VALUES ($1, $2)", [
            req.body.chatroomID,
            newEventID])
        let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
            req.body.chatroomID,
            0,
            JSON.stringify({
                "initiator-id": req.session['user'],
                "update": ` created a new event: ${req.body.name}`
            }),
            "msg-system-new-event"
        ])).rows[0].id;

        io.to(`room-${req.body.chatroomID}`).emit('new-message', {
            'roomID': req.body.chatroomID,
            'msgID': messageID
        })
        io.to(`room-${req.body.chatroomID}`).emit('new-event', (req.body.chatroomID));
        await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
            req.body.chatroomID
        ])
        
        res.json({
            "success": true,
            "newEventID": newEventID
        });
    } catch (e) {
        console.log(e);
        res.json({"success": false});    
    }
})

//  Add an existing event to group calendar
// [code review]better route: /chatroom/:room/event/:event/calendar
eventRoutes.post('/calendar/:room/:event', isChatroomMember, async (req, res) => {
    if (req.body['isChatroomMember']) {
        try {
            let eventQuery = (await client.query("SELECT * FROM chatroom_event LEFT JOIN event on chatroom_event.event_id = event.id WHERE chatroom_id = $1 AND event_id = $2", [
                parseInt(req.params.room),
                parseInt(req.params.event)
            ])).rows
            if (eventQuery.length > 0) {
                res.json("This event is already in the chatroom calendar.")
            } else {
                await client.query("INSERT INTO chatroom_event (chatroom_id, event_id) VALUES ($1, $2)", [
                    parseInt(req.params.room),
                    parseInt(req.params.event)])

                let eventNameQuery = (await client.query("SELECT event.name FROM event WHERE id = $1", [
                    parseInt(req.params.event)
                ])).rows
                let messageID = (await client.query('INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id', [
                    parseInt(req.params.room), 
                    0,
                    JSON.stringify({
                        "initiator-id": req.session['user'],
                        "update": ` added ${eventNameQuery[0].name} to the group calendar.`
                    }),
                    "msg-system-new-event"
                ])).rows[0].id;
            
                io.to(`room-${parseInt(req.params.room)}`).emit('new-message', {
                    'roomID': parseInt(req.params.room),
                    'msgID': messageID
                })
                io.to(`room-${parseInt(req.params.room)}`).emit('new-event', (parseInt(req.params.room)))
                await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                    parseInt(req.params.room)
                ])

                res.json({"success": true});  
            }
        } catch (e) {
            console.log(e);
            res.json({"success": false});    
        }
    } else {
        res.json("You must be part of this group to modify its event calendar.")
    }
    
})