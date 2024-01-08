//  In typedef files:
enum MessageType {
    msgPlaintext = 1,
    msgImageAttached,
    msgFileAttached,
    msgDeleted,
    etc
}

enum SystemNotifType {
    msgSystemGroupCreation = 1,
    msgSystemNewIslander,
    msgSystemIslanderLeft,
    etc
}

////    Because a 'message' can take different forms, you need to define multiple interfaces for type-checking during different stages of your CRUD operations

//  A message object sent from client to server (req.body.message). sender_id and chatroom_id are found in req.session['user'] and req.params.room respectively
//      The frontend should determine the 'type' of the message based on its contents.
interface MessageRequestBody {
    type: MessageType,
    textContent?: String,
    imageAttachments?: String[],
    fileAttachments?: String[],
    linkedContentID?: Number
}

//  A database record retrieved from the table island.message 
interface MessageRow {
    sender_id: Number,
    chatroom_id: Number,
    time_sent: Date,
    type: MessageType,
    content?: String,
    linked_content_id: Number
}

//  A message object sent from server to client (res.json(messages))
interface MessageDTO {
    sender_id: Number,
    chatroom_id: Number,
    time_sent: Date,
    type: MessageType,

    //  Depending on the message type, a message object may or may not have the following fields
    content?: String,
    attachments?: String[],
    linked_content_id?: Number,
    eventInfo?: {
        id: Number,
        name: String,
        description: String,
        starting_datetime: Date,
    },
    systemNotif?: {
        type: SystemNotifType
    }
    
}

interface MessageHandler {
    type: MessageType;
    //    Takes a req.body.message object, inserts it into the database, and in some cases returns the ID of the new record
    insertToDB(message: MessageRequestBody, sender: Number, room: Number): Promise<Number> | Promise<void>; 
    //    Retrieves a database message record and processes it before the sending to the frontend  
    processFromDBRecord(row: MessageRow): Promise<MessageDTO>;
    //    Takes a message ID and deletes the database message record with said ID
    removeFromDB(messageID: Number): Promise<void>; 
    //    Takes a req.body.message object and updates a database message record
    updateToDB(message: MessageRequestBody): Promise<void>;
}

class PlaintextMessageHandler implements MessageHandler {
    type: MessageType.msgPlaintext;
    async insertToDB(message: MessageRequestBody, sender: Number, room: Number): Promise<void> {
        await client.query("INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4)", [
            room,
            sender,
            message.textContent,
            this.type
        ])
    }
    async processFromDBRecord(row: MessageRow): Promise<MessageDTO> {
        return row
    }
    async removeFromDB(messageID: Number): Promise<void> {
        //  delete logic
    }
    async updateToDB(message: MessageRequestBody): Promise<void> {
        //  edit logic
    }

}

class ImageAttachedMessageHandler implements MessageHandler {
    type: MessageType.msgImageAttached;
    async insertToDB(message: MessageRequestBody, sender: Number, room: Number): Promise<void> {
        let newMessageID = await client.query("INSERT INTO message (chatroom_id, sender_id, time_sent, content, message_type) VALUES ($1, $2, NOW(), $3, $4) RETURNING id", [
            room,
            sender,
            message.textContent,
            this.type
        ]).rows[0].id
        if (message.imageAttachments) {
            for (let attachment of message.imageAttachments) {
                await client.query("INSERT INTO message_attachment (message_id, attached_file) VALUES ($1, $2)", [
                    newMessageID,
                    attachment
                ])
            }
        }
        
    }
    async processFromDBRecord(row: MessageRow): Promise<MessageDTO> {
        //  ...
    }
    async removeFromDB(messageID: Number): Promise<void> {
        //  ...
    }
    async updateToDB(message: MessageRequestBody): Promise<void> {
        //  ...
    }

}

//  Design pattern: 'Factory' 
//  Put similar classes in the same place. Here the message handlers for all the different message types are grouped into the same MessageHandlers object,
//      and can be called by simply inputting e.g. MessageHandlers[MessageType.msgPlaintext]
const MessageHandlerFactory = (type: MessageType): MessageHandler | null => {
    switch(type) {
        case (MessageType.msgPlaintext): 
            return new PlaintextMessageHandler();
        case (MessageType.msgImageAttached): 
            return new ImageAttachedMessageHandler();
        default:
            //  If user inputs an invalid MessageType, return null
            return null
    }
    
}



//  In server:
messageRoutes.post('/message/:room', async(req, res) => {

    let handler = MessageHandlerFactory(req.body.message.type);

    if (handler != null) { 
        try {
            handler.insertToDB(req.body.message, req.session['user'], req.params.room)
            res.json("Message sent successfully!")
        } catch (e) {
            console.log(e)
            res.json("Something went wrong")
        }
    }
})















//  Alex's code is better :(

/* class MsgPlaintext implements Message{
    private insertQuery: {
        body: 'INSERT INTO message (chatroom_id, time_sent, sender_id, message_type, content) VALUES ($1, NOW(), $2, $3, $4)',
        params: [Number, Number, MessageType, String]
    }
    private type: MessageType.msgPlaintext
    constructor(
        private chatroom_id: Number,
        private sender: Number,
        private content: {
            text: String
        }
    ) {
        this.insertQuery.params = [this.chatroom_id, this.sender, this.type, this.content.text]
    }
    optional?: { time_sent?: Date | undefined } | undefined
    
    insertIntoDatabase() {
        await client.query(this.insertQuery.body, this.insertQuery.params)
    }
}

class MsgImageAttached implements Message{
    private insertQuery: {
        body: 'INSERT INTO message (chatroom_id, time_sent, sender_id, message_type, content) VALUES ($1, NOW(), $2, $3, $4) RETURNING id',
        params: [Number, Number, MessageType, String]
    }
    private type: MessageType.msgImageAttached
    constructor(
        private chatroom_id: Number,
        private sender: Number,
        private content: {
            text?: String,
            attachments: String[]
        }
    ) {
        this.insertQuery.params = [this.chatroom_id, this.sender, this.type, this.content.text?]
    }
    optional?: { time_sent?: Date | undefined } | undefined

    insertIntoDatabase() {
        let newMessageId = await client.query(this.insertQuery.body, this.insertQuery.params)
        for (let attachment of this.content.attachments) {
            await client.query('INSERT INTO message_attachment (message_id, filename) VALUES ($1, $2)', [
                newMessageId,
                attachment
            ])
        }
    }
} 

//  In server
messageRoutes.post('/message/:room', async (req, res) => {
    let newMessage: Message;
    switch (req.body.type) {
        case (MessageType.msgPlaintext): 
            newMessage = new MsgPlaintext(
                req.params.room,
                req.session['user'],
                {
                    text: req.body.text
                }
            )
            await newMessage.insertIntoDatabase()
            break;
        case (MessageType.msgImageAttached):
            let newMessage = new MsgImageAttached(
                req.params.room,
            )
    }
    
})


messageRoutes.delete('/message/:room/:message', async (req, res) => {
    await deleteMessage(req.params.room, req.params.message)
})

async function deleteMessage(room: Number, message: Number): Promise<void> {
    let deletedMessageType: MessageType = await client.query("UPDATE message SET type=$1, content='' WHERE id = $2 AND chatroom_id = $3 RETURNING type", [MessageType.msgDeleted, message, room]).rows[0].type
    switch (deletedMessageType) {
        case (MessageType.msgImageAttached):
        case (MessageType.msgFileAttached):
            // delete attachments     
            break;
        default:
            break;
    }
}

/*

interface InsertMessageOperation {
    queryBody: String,
    queryParams: any[]
}

class InsertMsgPlaintext implements InsertMessageOperation {
    public queryBody: String = 'INSERT INTO message (chatroom_id, time_sent, sender_id, message_type, content) VALUES ($1, NOW(), $2, $3, $4)'
    public queryParams: [Number, Number, MessageType.msgPlaintext, String];
    constructor(chatroom_id: Number, sender_id: Number, content: String){
        this.queryParams[0] = chatroom_id,
        this.queryParams[1] = sender_id,
        this.queryParams[3] = content
    }
}


class InsertMsgImageAttached implements InsertMessageOperation {

}

*/


interface DeleteMessageOperation {
    deleteFromDatabase(): void
}
 
class DeleteMsgPlaintext implements DeleteMessageOperation {
    deleteFromDatabase(): void  {

    }
}


export {}