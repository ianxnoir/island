import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

import { client, io } from './main';
import { isChatroomAdmin, isChatroomMember } from './guards';

export const messageRoutes = express.Router();

//  Configuring multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads", "shared-files"));    
    },
    filename: (req, file, cb) => {
        //  upload name = `Island-${image | file}-timestamp.${format}`
        if (!req.body.attachments) {
            req.body.attachments = [];
        }
        let newFileName = `Island-${file.fieldname.split('-')[0]}-${Date.now()}.${file.mimetype.split('/')[1]}`
        req.body.attachments.push(newFileName);
        cb(null, newFileName);
    }
})
const upload = multer({storage});


//  Retrieving messages

messageRoutes.get('/message/room/:room/num/:num/offsetOrigin/:offsetOrigin/offsetDirection/:offsetDirection', isChatroomMember, async (req, res) => {
    if (!req.body['isChatroomMember']) {
        res.json('You must be a member of this chatroom in order to read its messages.')
    } else {
        let messages: any[] = [];
        let userMessageQuery = `SELECT id, sender_id as sender, time_sent, content, message_type as type, linked_content_id as linkedcontentid FROM message WHERE chatroom_id = $1 `
        let queryParams;
        try {
            if (parseInt(req.params.offsetOrigin) == 0) {
                let querySuffix = 'ORDER BY time_sent DESC LIMIT $2';
                userMessageQuery += querySuffix;
                queryParams = [
                    parseInt(req.params.room), 
                    parseInt(req.params.num)]
            } else {
                if (parseInt(req.params.offsetDirection) == 1) {
                    let querySuffix = 'AND time_sent > (SELECT time_sent FROM message WHERE id=$2) ORDER BY time_sent ASC LIMIT $3'
                        userMessageQuery += querySuffix;
                    queryParams = [
                        parseInt(req.params.room),
                        parseInt(req.params.offsetOrigin),
                        parseInt(req.params.num)]
                } else if (parseInt(req.params.offsetDirection) == -1) {
                    let querySuffix = 'AND time_sent < (SELECT time_sent FROM message WHERE id=$2) ORDER BY time_sent DESC LIMIT $3'
                        userMessageQuery += querySuffix;
                    queryParams = [
                        parseInt(req.params.room),
                        parseInt(req.params.offsetOrigin),
                        parseInt(req.params.num)]
                }
            } 
            messages = (await client.query('SELECT * FROM (' + userMessageQuery + ') AS sub ORDER BY sub.time_sent ASC', 
                queryParams)).rows
            for (let message of messages) {
                message['time_sent'] = message['time_sent'].toISOString();
                switch (message['type']) {
                    case 'msg-image-attached':
                    case 'msg-file-attached':
                        message['attachments'] = (await client.query('SELECT attached_file FROM message_attachment WHERE message_id=$1', [
                            message['id']])).rows
                        break;
                    case 'msg-share-event':
                        message['eventinfo'] = (await client.query('SELECT id, name, starting_datetime, description FROM event WHERE id = $1', [
                            message['linkedcontentid']])).rows[0];
                        break;
                    case 'msg-daily-checkin':
                        message['checkininfo'] = (await client.query('SELECT id, content FROM sticky_message WHERE id=$1', [
                            message['linkedcontentid']])).rows[0];
                        break;
                    default:
                        break;
                }
                if (message.sender == 0) {
                    let newContent = JSON.parse(message.content);
                    message.content = newContent;
                } else if (req.session['user'] == message.sender) {
                    message.position = 'self';
                } else {
                    message.position = 'other';
                }
            }
        } catch (e) {
            console.log(e)
        }
        if (messages.length < parseInt(req.params.num)) {
            // [code review] put fully updated or not into response JSON, make the res becomes an object
            io.to(`user-${req.session['user']}`).emit('message-history-fully-updated', req.params.offsetDirection);
        }
        res.json(messages);
    }
})

messageRoutes.get('/message/single/room/:room/msg/:msg', isChatroomMember, async (req, res) => {
    if (!req.body['isChatroomMember']) {
        res.json('You must be a member of this chatroom in order to read its messages.')
    } else {
        let message: any[] = [];
        let userMessageQuery = `SELECT id, sender_id as sender, time_sent, content, message_type as type, linked_content_id as linkedcontentid FROM message WHERE chatroom_id = $1 AND id = $2`
        let queryParams = [
            parseInt(req.params.room),
            parseInt(req.params.msg)
        ];
        try {
            message = (await client.query(userMessageQuery, queryParams)).rows[0]
            message['time_sent'] = message['time_sent'].toISOString();
            switch (message['type']) {
                case 'msg-image-attached':
                case 'msg-file-attached':
                    message['attachments'] = (await client.query('SELECT attached_file FROM message_attachment WHERE message_id=$1', [
                        message['id']])).rows
                    break;
                case 'msg-share-event':
                    message['eventinfo'] = (await client.query('SELECT id, name, starting_datetime, description FROM event WHERE id = $1', [
                        message['linkedcontentid']])).rows[0];
                    break;
                case 'msg-daily-checkin':
                    message['checkininfo'] = (await client.query('SELECT id, content FROM sticky_message WHERE id=$1', [
                        message['linkedcontentid']])).rows[0];
                    break;
                default:
                    break;
            }
            if (message['sender'] == 0) {
                let newContent = JSON.parse(message['content']);
                message['content'] = newContent;
            } else if (req.session['user'] == message['sender']) {
                message['position'] = 'self';
            } else {
                message['position'] = 'other';
            }
        } catch (e) {
            console.log(e)
        }
        res.json(message);
    }
})


//  Sending new message
messageRoutes.post('/message/room/:room', upload.fields([
    {name: 'image-attachment'}, 
    {name: 'file-attachment', maxCount: 1}
]), isChatroomMember, async (req, res) => {
    if (req.session) {
        if (!req.body['isChatroomMember']) {
            res.json('You must be a member of this chatroom to send messages to it.')    
        } else {
            let queryBody = 'INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type, linked_content_id) VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING id'
            let queryParams = [
                parseInt(req.params.room),
                req.session['user'],
                req.body.content,
                req.body['message-type'],
                parseInt(req.body['linked-content-id'])
            ]
            let messageID = (await client.query(queryBody, queryParams)).rows[0].id;
            if (req.body.attachments) {
                for (let filename of req.body.attachments) {
                    await client.query('INSERT INTO message_attachment (message_id, attached_file) VALUES ($1, $2)', 
                        [messageID, filename]);
                }
            }
    
            //  Update the "last_active_at" column of the chatroom table
            await client.query('UPDATE chatroom SET last_active_at = NOW() WHERE id = $1', [
                parseInt(req.params.room),])
    
            //  Inform all users in the room that there is a new message.
            io.to(`room-${req.params.room}`).emit('new-message', {
                'roomID': parseInt(req.params.room),
                'msgID': messageID
            });
            res.json('Message sent successfully!')   
        }
    } else {
        res.json('User must be logged in to send messages!')
    }
})


//  Deleting messages
messageRoutes.delete('/message/:msg/:room', isChatroomAdmin, async (req, res) => {
    let queryParams = [
        parseInt(req.params.msg),
        parseInt(req.params.room)
    ]
    let senderAndTypeQuery = (await client.query('SELECT sender_id, message_type FROM message WHERE id = $1', [
        queryParams[0]])).rows[0]
    if (req.body['hasAdminRights'] == true || senderAndTypeQuery.sender_id == req.session['user']) {
        if (senderAndTypeQuery.message_type == "msg-image-attached" || senderAndTypeQuery.message_type == "msg-file-attached") {
            let attachments = (await client.query('SELECT * FROM message_attachment WHERE message_id = $1', [
                queryParams[0]])).rows
            if (attachments.length > 0) {
                for (let attachment of attachments) {
                    await fs.promises.unlink(path.join(__dirname, "uploads", "shared-files", attachment.attached_file));
                }
            }
            await client.query('DELETE FROM message_attachment WHERE message_id = $1', [
                queryParams[0]])
        }
        await client.query("UPDATE message SET message_type='msg-deleted', content='', linked_content_id=NULL WHERE id = $1 AND chatroom_id = $2",
            queryParams)
        io.to(`room-${req.params.room}`).emit('deleted-message', {
            msg: parseInt(req.params.msg),
            room: parseInt(req.params.room)
        });
        res.json("Message deleted.")
    }
})


//  Retrieving shared files
messageRoutes.get('/file/room/:room/filename/:filename', isChatroomMember, (req, res) => {
    if (req.body['isChatroomMember'] == true) {
        res.download( path.join(__dirname, 'uploads','shared-files', req.params.filename) );    
    } else {
        res.json("You don't have the appropriate permissions to download this file!")
    }
})

messageRoutes.get('/image/room/:room/filename/:filename', isChatroomMember, (req, res) => {
    if (req.body['isChatroomMember'] == true) {
        res.download( path.join(__dirname, 'uploads','shared-files', req.params.filename) );    
    } else {
        res.json("You don't have the appropriate permissions to download this file!")
    }
})