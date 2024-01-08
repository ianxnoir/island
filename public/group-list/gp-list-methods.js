//  Vue methods

const initChatroom = async (roomID) => {
    //  Reinitialise all variables
    app.chatroomInfo = {};
    app.memberData = [];
    app.stickyDisplayMode = "sticky-message-hidden";
    app.requestPending = false;
    app.messageData = [];
    app.sysnotifData = [];
    app.getMessagesOffset = {
            origin: 0,
            direction: 0
        };
    app.fullyUpdatedTop = false;
    app.fullyUpdatedBot = false;
    app.loadedAttachments = [];
    app.currentOverlay = "overlay-none";
    app.imgPreviewMode = "image-preview-icon";
    app.imgPreviewSrc = "";
    app.imgPreviewIndex = 0;
    app.imgPreviewIndexMax = 0;
    app.selectedImages = [];
    app.selectedFiles = [];
    app.currentOverlayLarge = "large-overlay-none";
    app.chatroomOverlayHistory = ['large-overlay-none'];
    app.emojiSelectorVisible = false;
    app.shiftIsDown = false;
    app.chatroomEvents = [];
    app.sharingEvent = null;
    app.activeVideoCallers = {};
    app.peers = {};
    app.pinnedChatroom = [];

    //  Retrieve information and messages for this chatroom
    getChatroomInfo(roomID);
    app.currRoomID = roomID;
    await getMessages(roomID, 10, app.getMessagesOffset.origin, app.getMessagesOffset.direction)
    getChatroomEvents(roomID);
    document.querySelector(".msg-display-box").scrollTop = document.querySelector(".msg-display-box").scrollHeight;
}

const deleteIslander = async (roomID, islanderID) => {
    await fetch (`/member/${roomID}/${islanderID}`, {
        method: "DELETE"
    })
}

//  Asks the server for information about the current chatroom
const getChatroomInfo = async (roomID) => {
    let res = await fetch(`/chatroom/id/${roomID}`, {
        method: "GET"
    });
    let info = await res.json();
    app.chatroomInfo = {};
    app.chatroomInfo = info;
    app.memberData = [];
    app.memberData = info['chatroomMembers']
}

const toggleStickyDisplayMode = (mode) => {
    app.stickyDisplayMode = mode;
}

const postMessage = async () => {
    const inputBox = document.getElementById('input-box');
    const imgUploader = document.getElementById('upload-image');
    const fileUploader = document.getElementById('upload-file');
    
    let body;
    
    if (imgUploader.files.length > 0) {
        body = new FormData(document.querySelector('.image-form'));
        body.append("message-type", "msg-image-attached");
        clearImageInputs();
    } else if (fileUploader.files.length > 0) {
        body = new FormData(document.querySelector('.file-form'));
        body.append("message-type", "msg-file-attached");
        clearFileInputs();
    } else {
        body = new FormData();
        if (inputBox.value.trim() != "") {
            body.append("message-type", "msg-plaintext");    
        } else {
            return;
        }
    } 

    if (inputBox.value.trim() != "") {
        body.append ("content", inputBox.value);
    }

    body.append ("linked-content-id", 0);

    inputBox.value = "";

    for (let entry of body) {
        console.log(entry)
    }
    
    await fetch (`/message/room/${app.currRoomID}`, {
        method: "POST",
        body: body
    })

    if (inputBox.value == "" && fileUploader.value == "" && imgUploader.value == "") {
        swapOverlay("overlay-none");
        return;
    } else {
        postMessage();
    }
}

const deleteMessage = async (messageID, roomID) => {
    await fetch (`/message/${messageID}/${roomID}`, {
        method: "DELETE"
    })
}

const removeDeletedMessage = (messageID) => {
    let newMessages = []
    for (let message of app.messageData) {
        if (parseInt(message.id) == messageID) {
            let newMessage = {
                id: message.id,
                sender: message.sender,
                type: "msg-deleted",
                time: message.time,
                date: message.date,
                position: message.position
            }
            newMessages.push(newMessage)
        } else {
            newMessages.push(message)
        }
    }
    app.messageData = newMessages;
}

const getSingleMessage = async (roomID, msgID) => {
    app.requestPending = true;
    let res = await fetch(`/message/single/room/${roomID}/msg/${msgID}`, {
        method: "GET"
    });
    let resMessage = await res.json();
    app.messageData = app.messageData.concat(resMessage);
    app.requestPending = false;
}

const getMessages = async (roomID, messageNum, offsetOrigin, offsetDirection) => {
    //  params:
    //  id: chatroom id
    //  num: number of messages to retrieve
    //  offsetorigin?: id of beginning or ending message in client-side message array (if not provided, retrieves the latest messages)
    //  offsetdirection?: retrieve messages before or after offsetorigin (i.e. whether the user is scrolling up or down) (-1: before, 1: after, default: newest)
    app.requestPending = true;
    let res = await fetch(`/message/room/${roomID}/num/${messageNum}/offsetOrigin/${offsetOrigin}/offsetDirection/${offsetDirection}`, {
        method: "GET"   
    })
    let resMessages = await res.json();
    if (offsetDirection == -1) {
        app.messageData = resMessages.concat(app.messageData);
    } else if (offsetDirection == 1 || offsetDirection == 0) {
        app.messageData = app.messageData.concat(resMessages);
    }
    if (app.messageData[0] != undefined) {
        app.getMessagesOffset.origin = app.messageData[0]['id'];
    }
    app.requestPending = false;
}

const getMessagesOnScroll = () => {
    //  onscroll, calculate number of extra messages to be retrieved from server
    if (!app.requestPending) {
        const msgDisplayBox = document.querySelector('.msg-display-box');
        if (!app.fullyUpdatedTop && !app.requestPending && msgDisplayBox.scrollTop < 200) {
            getMessages(app.currRoomID, 10, app.getMessagesOffset.origin, -1);
        } else if (!app.fullyUpdatedBot && !app.requestPending && (msgDisplayBox.scrollHeight - msgDisplayBox.scrollTop) < (msgDisplayBox.offsetHeight + 100)) {
            getMessages(app.currRoomID, 10, app.messageData[app.messageData.length - 1].id, 1);
        }
    }
}

const swapOverlay = (targetOverlay) => {
    const msgInputBox = document.querySelector('#input-box');
    const iconsNormal = document.getElementById('icons-normal');
    const iconsInOverlay = document.getElementById('icons-in-overlay');
    app.currentOverlay = targetOverlay;
    switch (targetOverlay) {
        case "overlay-upload-image":
            iconsInOverlay.classList.toggle('hidden', false);
            iconsNormal.classList.toggle('hidden', true);
            msgInputBox.placeholder = "Add a caption"; 
            break;
        case "overlay-upload-file":
            iconsInOverlay.classList.toggle('hidden', false);
            iconsNormal.classList.toggle('hidden', true);
            msgInputBox.placeholder = "Add a message";
            break;
        case "overlay-none":
            iconsInOverlay.classList.toggle('hidden', true);
            iconsNormal.classList.toggle('hidden', false);
            msgInputBox.placeholder = "Type a message";
    }
}

const swapOverlayLarge = (targetOverlay) => {
    if (targetOverlay == 'large-overlay-none') {
        app.chatroomOverlayHistory = ['large-overlay-none']    
    } else {
        app.chatroomOverlayHistory.push(targetOverlay);
    }
    app.currentOverlayLarge = targetOverlay;
}

const unloadAttachments = () => {
    app.loadedAttachments = [];
    swapOverlay("overlay-none")
}

const returnToPreviousOverlayLarge = () => {
    app.currentOverlayLarge = app.chatroomOverlayHistory[app.chatroomOverlayHistory.length - 2];
    app.chatroomOverlayHistory.pop();
}

const logSelectedFiles = (evt) => {
    app.selectedFiles = [];
    const files = evt.target.files
    for (let i = 0; i < files.length; i++) {
        app.selectedFiles = app.selectedFiles.push(files[i].name);
    }
}

const logSelectedImages = (evt) => {
    const images = evt.target.files
    app.selectedImages = [];

    if (images.length == 0) {
        app.imgPreviewIndex = 0;
        app.imgPreviewIndexMax = 0;
        app.imgPreviewIcon = '<i class="far fa-images"></i>'
        return
    } else {
        app.imgPreviewIndexMax = images.length - 1;
        generatePreview(images)
    }
    for (let i = 0; i < images.length; i++) {
        app.selectedImages.push(images[i].name);
    }
}

const generatePreview = (images) => {
    const reader = new FileReader();
    reader.onload = function() {
        app.imgPreviewMode = "image-preview-full"
        app.imgPreviewSrc = reader.result;
    }
    reader.readAsDataURL(images[app.imgPreviewIndex]);
}

const handleInput = () => {
    const inputBox = document.querySelector('#input-box');
    
    //  Editing CSS variables controlling the heights of various elements
    const root = document.querySelector(':root');

    //  Resizing input textarea and the message display area to match
    inputBox.style.height = "auto";
    inputBox.style.height = inputBox.scrollHeight + "px";
    if (inputBox.scrollHeight > 90) {
        root.style.setProperty ("--input-area-size", "170px"); 
    } else if (inputBox.scrollHeight > 75) {
        root.style.setProperty ("--input-area-size", "155px");
    } else {
        root.style.setProperty ("--input-area-size", "120px");
    }
    inputBox.scrollTop = inputBox.scrollHeight;
}

const specialKeyPress = (evt) => {
    if (evt.key == "Enter") {
        //  Pressing Enter would send a message
        //  Pressing Enter while holding down Shift starts a new row
        if (app.shiftIsDown) {
            return;
        } else {
            postMessage();
            evt.preventDefault();
        }        
    }
    if (evt.key == "Tab") {
        if (evt.target.selectionStart == '0') {
            return;
        } else if (evt.target.selectionStart) {
            evt.preventDefault();
            const startPos = evt.target.selectionStart;
            const endPos = evt.target.selectionEnd;
            evt.target.value = evt.target.value.substring(0, startPos)
                + `   `
                + evt.target.value.substring(endPos, evt.target.value.length);
        } else {
            evt.preventDefault();
            evt.target.value += `   `;
        }
    }
    if (evt.key == "Shift") {
        app.shiftIsDown = true;
    }
}

const shiftReleased = (evt) => {
    if (evt.key == "Shift") {
        app.shiftIsDown = false;
    }
}

const toggleEmojiSelector = () => {
    app.emojiSelectorVisible = !app.emojiSelectorVisible
    const root = document.querySelector(':root');
    if (app.emojiSelectorVisible) {
        root.style.setProperty("--emoji-selector-size", "132px");
    } else {
        root.style.setProperty("--emoji-selector-size", "0px")
    }
}

const clearFileInputs = () => {
    document.getElementById('upload-file').value = "";
    app.selectedFiles = [];
}

const clearImageInputs = () => {
    document.getElementById('upload-image').value = "";
    app.selectedImages = [];
    app.imgPreviewIndex = 0;
    app.imgPreviewIndexMax = 0;
    app.imgPreviewSrc = "";
}

function parseSysnotifContent(messages) {
    let isSysNotif = new RegExp ('msg-system', "i");
    for (let message of messages) {
        if (isSysNotif.test(message.type)) {
            try {
                let newContent = JSON.parse(message.content);
                message.content = newContent;
            } catch (e) {
                console.log(e)
            }
        }
    }
    return messages
}

function convertToLocaleTimezone(messages) {
    for (let message of messages) {
        if (message.time_sent) {
            let date = message.time_sent.toString().substring(0, 10).split("-");
            let time = message.time_sent.toString().substring(11).split(":");
            let local_time_sent = new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1]))
            message.date = local_time_sent.toLocaleDateString();
            message.time = local_time_sent.toLocaleTimeString().split(":")[0] + ":" + local_time_sent.toLocaleString().substr(11).split(":")[1];
            if (message.type == 'msg-share-event') {
                message.eventinfo = convertEventTimeToLocaleTimezone(message.eventinfo);
            }
        }
    }
    return messages 
}

function addDateMarkers(messages) {
    let newMessages = [];
    for (let i = 0; i < messages.length; i++) {
        if (i == 0) {
            newMessages.push({
                id: messages[i].id + 0.1,
                date: messages[i].date,
                type: 'msg-system-datemarker'
            })
        } else if (messages[i].date != messages[i - 1].date) {
            newMessages.push({
                id: messages[i].id + 0.1,
                date: messages[i].date,
                type: 'msg-system-datemarker'
            })
        }
        newMessages.push(messages[i])
    }
    return newMessages;
}

function refactorMessageBubbles(messages) {
    let isSysNotif = new RegExp ('msg-system', "i");
    for (let i = 1; i < messages.length; i++) {
        if (messages[i] === undefined) {
            break;
        }
        if (isSysNotif.test(messages[i].type)) {
            continue;
        } else {
            if (messages[i].sender == messages[i - 1].sender) {
                messages[i].position += " sender-name-hidden";
            } else {
                messages[i].position += " msg-spaced";
            }
            if (messages[i].time == messages[i - 1].time &&
                messages[i].date == messages[i - 1].date &&
                messages[i].sender == messages[i - 1].sender) {
                messages[i - 1].position += " time-hidden"
            }
        }
    }
    return messages;
    
    //  new class tags: sender-name-hidden, spaced
}

function convertEventTimeToLocaleTimezone(events) {
    if (events instanceof Array){
        for (let event of events) {
            event.date = new Date(event.starting_datetime).toLocaleDateString()
            event.time = new Date(event.starting_datetime).toLocaleTimeString()
        }
        return events;
    } else {
        events.date = new Date(events.starting_datetime).toLocaleDateString()
        events.time = new Date(events.starting_datetime).toLocaleTimeString()
        return events;
    }
}

const getChatroomEvents = async (roomID) => {
    app.chatroomEvents = [];
    let res = await fetch (`/event/id/${roomID}`)
    let events = await res.json();
    events.events = convertEventTimeToLocaleTimezone(events.events)
    app.chatroomEvents = events.events;
}

const shareEvent = async (eventID) => {
    app.sharingEvent = eventID;
    await getChatroomEvents(app.currRoomID); 
    swapOverlayLarge('large-overlay-share-event');
}    

const sendShareEventMessages = async (roomArr, eventID, content) => {
    let body = new FormData() 
    body.append("message-type", "msg-share-event")
    body.append("linked-content-id", eventID)
    body.append("content", content)
    console.log(roomArr)
    for (let room of roomArr) {
        await fetch (`/message/room/${room}`, {
            method: "POST",
            body: body
        })
    }                
    swapOverlayLarge('large-overlay-none')
}


const startVideoChat = async () => {
    console.log("TODO")
    /*
    swapOverlayLarge('large-overlay-videochat-full-view')
    setTimeout(async function() {
        const myPeer = new Peer(undefined, {
          host: '/',
          port: '3001'
        })
        const myVideo = document.createElement('video')
        myVideo.muted = true
        myVideo.id = `stream-user-${app.userInfo.id}`
        myVideo.muted = true
        app.userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        addVideoStream(myVideo, app.userStream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
              addVideoStream(video, userVideoStream)
            })
        })

        myPeer.on('open', id => {
            socket.emit('join-video-call', app.currRoomID)
        })

        socket.on('new-video-caller', userId => {
            connectToNewUser(userId, stream)
        })

        socket.on('video-caller-disconnected', userId => {
            if (app.peers[userId]) app.peers[userId].close()
        })
    }, 1000)*/    
}

/*
    //  video = HTML video object
    //  stream = metadata for the video stream being sent across the network
    function addVideoStream(video, stream) {
        const videoGrid = document.getElementById('video-grid')
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        videoGrid.append(video)
    }
    
    function connectToNewUser(userId, stream) {
      const call = myPeer.call(userId, stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })
    
      peers[userId] = call
    }
*/