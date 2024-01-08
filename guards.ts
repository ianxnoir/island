//  guards.ts
//  Contains guard middleware for Island messaging service

import express from 'express';

import { client } from './main';


//  Middleware that checks if user is logged in
export const isLoggedIn = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session['user']) {
        next();
    } else {
        res.redirect('/login.html?redirect=' + encodeURIComponent(req.path));
    }
}


//  Middleware that checks if user is in a specific chatroom
export const isChatroomMember = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let queryParams = [
        req.session['user'],
        parseInt(req.params.room)
    ];
    const memberQuery = (await client.query('SELECT * FROM chatroom_membership WHERE member_id = $1 AND chatroom_id = $2', 
        queryParams)).rows
    if (memberQuery.length > 0) {
        req.body['isChatroomMember'] = true;
    } else {
        req.body['isChatroomMember'] = false;
    }
    next()
}

declare global {
    namespace Express {
      interface Request {
        hasAdminRights?: boolean
      }
    }
  }
  

/*export const isChatroomAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let queryParams = [
        req.session['user'],
        parseInt(req.params.room)
    ];
    const adminQuery = (await client.query('SELECT a.member_role, b.id FROM chatroom_membership AS a LEFT JOIN personal_chatroom AS b on a.chatroom_id = b.chatroom_id WHERE a.member_id = $1 AND a.chatroom_id = $2', 
        queryParams)).rows
    if (adminQuery[0].member_role == "admin" || adminQuery[0].id > 0) {
        req.hasAdminRights = true;
    } else {
        req.hasAdminRights = false;
    }
    next()
}*/

//  Middleware that checks if user is the admin of a specific chatroom
export const isChatroomAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let queryParams = [
        req.session['user'],
        parseInt(req.params.room)
    ];
    const adminQuery = (await client.query('SELECT a.member_role, b.id FROM chatroom_membership AS a LEFT JOIN personal_chatroom AS b on a.chatroom_id = b.chatroom_id WHERE a.member_id = $1 AND a.chatroom_id = $2', 
        queryParams)).rows
    if (adminQuery[0].member_role == "admin" || adminQuery[0].id > 0) {
        req.body['hasAdminRights'] = true;
    } else {
        req.body['hasAdminRights'] = false;
    }
    next()
}


//  Middleware that checks if user is allowed to view another user's content (based on their privacy settings)
export const mayViewContent = (req: express.Request, res: express.Response, next: express.NextFunction) => {

}