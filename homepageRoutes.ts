import express from 'express';
//  import moment from 'moment';


import { client } from './main'; // for connecting to database 

export const homepageRoutes = express.Router();

// Get userInfo

// Get from login a/c (Connected with [homepage.js])
homepageRoutes.get('/userInfo',async(req,res) => {
  let currentUserInfo = (await client.query('SELECT id, nickname, email, islander_icon, bio, joined_at, last_seen_at FROM islander where id = $1', 
  [req.session['user']])).rows[0]
  console.log(currentUserInfo)
  res.json(currentUserInfo)
  
})

//  ---- Chatroom search ----

//Listout ALL the Chatrooms that the Current User has as well as their most recent message
homepageRoutes.get('/userChatroomInfo', async (req,res) => {
  try {
    let currentUserRooms = (await client.query("SELECT chatroom.name, chatroom.last_active_at, chatroom.privacy, chatroom.chatroom_icon, chatroom_id FROM chatroom JOIN chatroom_membership on chatroom.id = chatroom_id WHERE member_id=$1 AND (member_role IS NULL OR member_role !='inactive') ORDER BY chatroom.last_active_at DESC", 
      [req.session['user']])).rows 
    for (let row of currentUserRooms) {
        let queryRes = (await client.query('SELECT a.id, a.sender_id as sender, b.nickname, a.time_sent, a.content, a.message_type as type, a.linked_content_id as linkedcontentid FROM message AS a LEFT JOIN islander AS b ON a.sender_id = b.id WHERE a.chatroom_id = $1 ORDER BY a.time_sent DESC LIMIT 1', [
        row.chatroom_id])).rows
      if (queryRes.length > 0) {
        row.latestMessage = queryRes[0]
      }
      row.memberData = (await client.query('SELECT b.nickname, b.islander_icon, a.member_id, a.member_role AS role, a.member_joined_at AS joined FROM chatroom_membership a LEFT JOIN islander b ON a.member_id = b.id WHERE a.chatroom_id=$1', [
        parseInt(row.chatroom_id)])).rows;
    }
    res.json(currentUserRooms)
  } catch (e) {
    console.log(e)
    res.json ("error retrieving user info")
  }
})

// ---- Search User ---- (Connected with [discover.js])

homepageRoutes.get('/path/:search',async (req,res) => {
  console.log(req.params.search)
  let searchUser_result = (await client.query("SELECT * FROM islander WHERE nickname LIKE $1",['%' + req.params.search +'%' ])).rows[0]
  res.json(searchUser_result)
})

// ---- Search Island/Room ---- (Connected with [discover.js])

homepageRoutes.get('/path01/:search',async (req,res) => {
  console.log(req.params.search)
  let searchIsland_result = (await client.query("SELECT * FROM chatroom WHERE name LIKE $1",['%' + req.params.search +'%' ])).rows
  res.json(searchIsland_result)
  console.log(searchIsland_result)
})

// ---- Get User Pinned Room Info ---- (Connected with [island_chat.js])
homepageRoutes.get('/userChatroom_pin', async (req,res) => {
  try {
    let currentUserRooms_pin = (await client.query("SELECT chatroom.name, chatroom.last_active_at, chatroom.privacy, chatroom.chatroom_icon, chatroom_id FROM chatroom JOIN chatroom_membership on chatroom.id = chatroom_id WHERE member_id=$1 AND pinned_room=TRUE AND (member_role IS NULL OR member_role !='inactive') ORDER BY chatroom.last_active_at DESC", 
      [req.session['user']])).rows 
    console.log(currentUserRooms_pin)
    res.json(currentUserRooms_pin)
  } catch (e) {
    console.log(e)
    res.json ("error retrieving user info")
  }
})

// ---- Collect user's Notifications ---- (Connected with [homepage.js])
homepageRoutes.get('/collectNotify', async (req,res) => {
  try {
    let collectNotify = (await client.query("SELECT notify_type, notify_content FROM notifications WHERE islander_id=$1", 
      [req.session['user']])).rows 
  
    console.log(collectNotify)
    res.json(collectNotify)
  } catch (e) {
    console.log(e)
    res.json ("error retrieving user info")
  }
})