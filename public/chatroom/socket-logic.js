//  Socket.io
const socket = io.connect();



//  'new-message' does strictly more than 'new-room'. In situations where you have to update both a chatroom's messages
//  and other chatroom-related information, simply call 'new-message'
socket.on('new-message', (msgInfo) => {
    console.log(`user has received a new message at room ${msgInfo.roomID}`);
    
    if (msgInfo.roomID == app.currRoomID) {
        app.fullyUpdatedBot = false;
        getSingleMessage(app.currRoomID, msgInfo.msgID);
        app.fullyUpdatedBot = true;
    } 
    getUserRooms();
})

socket.on('new-room', () => {
    getUserRooms();
    socket.emit('join-new-rooms')
})

socket.on('new-event', (room) => {
    getChatroomEvents(room);
})

socket.on('chatroom-info-updated', (room) => {
    if (room == app.currRoomID) {
        getChatroomInfo(app.currRoomID);
    }
})

socket.on('deleted-message', (msgInfo) => {
    console.log(msgInfo)
    if (msgInfo.room == app.currRoomID) {
        console.log("deleting message")
        app.removeDeletedMessage(msgInfo.msg)
    }
})

socket.on('message-history-fully-updated', (offset) => {
    if (offset == -1) {
        app.fullyUpdatedTop = true;
    } else if (offset == 1) {
        app.fullyUpdatedBot = true;
    }
})