/*-----------------
 Vue 2.0.3
-----------
https://vuejs.org/guide/
https://vuejs.org/api/

-----------------*/

async function initPage() {
  readUser_pin_room()
  await getUserRooms()
  const params = new URLSearchParams(location.search)
  if (params.get('room')) {
    for (let room of app.userRooms) {
      if (params.get('room') == room.chatroom_id) {
        enterChatView(params.get('room'))
      }
    }
  }
}

document.onload = initPage()




async function getUserRooms(){
  const res = await fetch('/userChatroomInfo')
  const userRooms = await res.json();
  
  app.userRooms = userRooms;
  console.log('userRooms updated')
}

// Read Pinned Rooms
async function readUser_pin_room(){
  console.log("fetch")
  const res = await fetch('/userChatroom_pin')
  const pinnedChatroom = await res.json();
  app.pinnedChatroom = pinnedChatroom;
  console.log(pinnedChatroom)
}

//  Methods
const enterChatView = (roomID) => {
  app.chatroomVisible = true;
  app.navStyle = "user-room-nav-sidebar";
  app.roomPreviewMode = "user-room-preview-sidebar";
  app.searchbarStyle = "island-searchbar-sidebar";
  initChatroom(roomID);
}


const app = new Vue({
  el: "#vue",
  data: {
    //  Room preview navbar and chatroom layout 
    pinRoomNavStyle: "pin-room-nav",

    roomSearch: "",
    userRooms: [],
    roomPreviewMode: "user-room-preview-wide", // | "user-room-preview-sidebar"
    navStyle: "user-room-nav-free", // | "user-room-nav-sidebar"
    searchbarStyle: "island-searchbar-free", // | "island-searchbar-sidebar"
    chatroomVisible: false,
  
    //  User information
    userInfo: {},

    //  Chatroom and member information
    currRoomID: -1,
    chatroomInfo: {},
    memberData: [],

    //  Sticky
    stickyDisplayMode: "sticky-message-hidden", //  "sticky-message-hidden" | "sticky-message-expanded" 

    //  Messages
    requestPending: false,
    messageData: [],
    sysnotifData: [],
    getMessagesOffset: {
        origin: 0,
        direction: 0
    },
    fullyUpdatedTop: false,
    fullyUpdatedBot: false,

    loadedAttachments: [],

    //  Image and file upload preview
    currentOverlay: "overlay-none",
    imgPreviewMode: "image-preview-icon",
    imgPreviewSrc: "",
    imgPreviewIndex: 0,
    imgPreviewIndexMax: 0,
    selectedImages: [],
    selectedFiles: [],

    //  Group information and event/goal creation overlay
    currentOverlayLarge: "large-overlay-videochat-full-view",
    chatroomOverlayHistory: ['large-overlay-none'],

    //  Emoji selector
    emojiSelectorVisible: false,

    //  Special keys
    shiftIsDown: false,

    //  Events
    chatroomEvents: [],
    sharingEvent: null,

    //  Videochat
    activeVideoCallers: {},
    peers: {},

   //   Current User's Pinned Rooms
    pinnedChatroom: []  
  },

  computed: {
    currentChatroomTopNavStyle: function() {
      if (this.chatroomInfo.privacy == 'personal') {
        return 'current-chatroom-top-navbar-personal'
      } else {
        return 'current-chatroom-top-navbar'
      }
    },
    filteredRooms: function () {
      let self = this;

      return this.userRooms.filter(function (room) {
        let parts = self.roomSearch.trim().split(" ");
        for (let part of parts) {
          let searchRegex = new RegExp(part, "i");
          if (
            searchRegex.test(room.name)
            ) {
            return true;
          } else {
            if (room.memberData) {
              for (let member of room.memberData) {
                if (searchRegex.test(member.nickname)) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      });
    },
    isAdmin: function () {
      for (let data of this.memberData) {
        if (this.userInfo.id == data.member_id) {
          if (data.role == "admin") {
            return true;
          } else {
            return false;
          }
        }
      }
      
    },




  
    totalMessages: function () {
        return this.messageData.length;
    },
    allSelectedFiles: function () {
        let arr = this.selectedFiles.concat(this.selectedImages);
        let prompt = arr.join(", ");
        if (prompt.length > 60) {
            return prompt.substring(0, 57) + "..."
        } else {
            return prompt;
        }
    },
    chatroomMembers: function () {
        let memberMap = new Map();
        for (let data of this.memberData) {
            if (data.role != 'inactive') {
              memberMap.set(data['member_id'], data.nickname)
            }
        };
        return memberMap;
    },
    chatroomMemberList: function () {
        let memberList = [];
        for (let data of this.memberData) {
          if (data.role != 'inactive') {
            memberList.push(data.nickname);
          }  
        }
        return memberList.join(', ');
    },
    fullInterestsList: function () {
        let interestMap = new Map();
        for (let data of this.chatroomInfo.allInterests) {
            interestMap.set(data.id, data.name)
        }
        return interestMap;
    }
  },
  methods: {
    enterChatView,


    //  Group methods
    initChatroom,
    getChatroomInfo,
    deleteIslander,

    //  Sticky methods
    toggleStickyDisplayMode,

    //  Submit message
    postMessage,
    //  Delete message
    deleteMessage,
    removeDeletedMessage,
    //  Message query and display methods
    getMessages,
    getMessagesOnScroll,

    //  Overlay methods
    swapOverlay,
    swapOverlayLarge,
    unloadAttachments,
    returnToPreviousOverlayLarge,
    logSelectedFiles,
    logSelectedImages,

    //  Text input and keypress methods
    handleInput,
    specialKeyPress,
    shiftReleased,
    //  Emoji selector methods
    toggleEmojiSelector,

    //  File/Image input methods
    clearImageInputs,
    clearFileInputs,

    //  Event methods
    getChatroomEvents,
    shareEvent,
    sendShareEventMessages,

    //  Videochat methods
    startVideoChat
  }
});