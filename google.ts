import express from 'express'
import dotenv from 'dotenv'
import grant from 'grant-express';

dotenv.config()

class GoogleLogin {
    public getMediator(): express.RequestHandler {
        return grant({
            "defaults": {
                // "protocol": "http",
                // "host": "localhost:8080",
                "origin": "http://localhost:8080",
                "transport": "session",
                "state": true,
            },
            "google": {
                "key": process.env.GOOGLE_CLIENT_ID || "",
                "secret": process.env.GOOGLE_CLIENT_SECRET || "",
                "scope": ["profile", "email"],
                "callback": "/login/google"
            }
        }) as express.RequestHandler;
    }
}
export const google = new GoogleLogin();

