export interface chatroom {
    "creator-id": Number,
    "name": String,
    "description": String | null,
    "privacy": "public" | "protected" | "private,",
    "chatroom-icon": String | null,
    "created_at": Date
}
