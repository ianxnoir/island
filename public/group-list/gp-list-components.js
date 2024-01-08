
Vue.component('pin-room-nav',{
    props:['pinnedChatroom'],
    template:`
            <section class="overflow-x">
                <div class="horizontal-friends-list">

                  <figure v-for="pinRoom in pinnedChatroom">
                    <picture>
                      <img v-bind:src='pinRoom.chatroom_icon'>
                    </picture>
                  </figure>

                </div>
              </section>
    `,
    // data() {
    //     return {
    //      pinnedChatroom: {},
    //     }
    // }
})


Vue.component('user-room-nav', {
    props: [
        'filteredRooms',
        'navStyle',
        'searchbarStyle',
        'userInfo'
    ],
    template: `
    <div v-bind:class='navStyle'>
        <input placeholder="Search My Islands" class="island-searchbar-free" v-model="$root.roomSearch" />
        <transition-group name="openUp" class="colors">
            <component 
                v-bind:is="$root.roomPreviewMode"
                v-for="(room, index) in filteredRooms" 
                v-bind:key="room['chatroom_id']"
                v-bind:room="room"
                v-bind:user-info='userInfo'>
            </component>
        </transition-group>
    </div>
    `,
})

    Vue.component('user-room-preview-wide', {
        props: ['room', 'userInfo'],
        template: `
        <div class="user-room-preview-wide"
            v-on:click="$root.enterChatView(room['chatroom_id'])">
                <div 
                    class='chatroom-preview-icon' 
                    v-if='previewData.icon != "none"'
                    v-bind:style="{ backgroundImage: 'url(' + previewData.icon + ')' }">
                </div>
                <div 
                    class='chatroom-preview-icon' 
                    v-else>
                </div>
                <span class='chatroom-preview-name'>{{ previewData.name }}</span>
                <img class='chatroom-preview-icon' src='/icons/mailboxes.png'>
                <span
                    v-if='latestMessageExists' 
                    class='chatroom-preview-message'>
                    <span
                        v-if="room.latestMessage.sender > 0">
                        {{ room.latestMessage.nickname }}
                    </span>
                        {{ messagePreview }}
                </span>
                <img class='chatroom-preview-icon' 
                    v-if="room.privacy !='personal'" 
                    src='/icons/privacy.png'>
                <span class='chatroom-preview-privacy'
                    v-if="room.privacy !='personal'">{{ room.privacy }}</span>
        </div>
        `,
        computed: {
            messagePreview: function() {
                switch(this.room.latestMessage.type) {
                    case "msg-plaintext":
                        return `: ${this.room.latestMessage.content}`
                    case "msg-image-attached":
                        return ` shared an image`
                    case "msg-file-attached":
                        return ` shared a file`
                    case "msg-share-event":
                        return ` shared an event`                        
                    case "msg-daily-checkin":
                        return ` checked-in to the daily goal`
                    case "msg-deleted":
                        return "(deleted message)"
                    case "msg-system-group-creation":
                        return `New group!`
                    case "msg-system-group-icon-change":
                        return `An Islander changed the Island icon`
                    case "msg-system-member-joined":
                        return `An Islander joined the group`
                    case "msg-system-group-info-change":
                    case "msg-system-member-left":
                    case "msg-system-member-role-change":                        
                    case "msg-system-new-event":
                        return `An Islander${JSON.parse(this.room.latestMessage.content).update}`
                }
            },
            latestMessageExists: function() {
                if (this.room.latestMessage == undefined) {
                    return false;
                } else {
                    return true;
                }
            },
            previewData: function() {
                if (this.room.privacy == 'personal') {
                    for (let member of this.room.memberData) {
                        if (member.member_id != this.userInfo.id) {
                            return {
                                icon: member.islander_icon,
                                name: member.nickname
                            }
                        }
                    }
                } else {
                    return {
                        icon: this.room.chatroom_icon,
                        name: this.room.name
                    }
                }
            }
        }
    });


    Vue.component('user-room-preview-sidebar', {
        props: ['room', 'userInfo'],
        template: `
        <div class="user-room-preview-sidebar"
            v-on:click="$root.initChatroom(room['chatroom_id'])">
                <div 
                    class='chatroom-preview-icon' 
                    v-if='previewData.icon != "none"'
                    v-bind:style="{ backgroundImage: 'url(' + previewData.icon + ')' }">
                </div>
                <div 
                    class='chatroom-preview-icon' 
                    v-else>
                </div>
                <span class='chatroom-preview-name'>{{ previewData.name }}</span> 
                <span
                    v-if='latestMessageExists' 
                    class='chatroom-preview-message'>
                    <span
                        v-if="room.latestMessage.sender > 0">
                        {{ room.latestMessage.nickname }}
                    </span>
                    {{ messagePreview }}
                </span>
        </div>
        `,
        computed: {
            messagePreview: function() {
                switch(this.room.latestMessage.type) {
                    case "msg-plaintext":
                        return `: ${this.room.latestMessage.content}`
                    case "msg-image-attached":
                        return ` shared an image`
                    case "msg-file-attached":
                        return ` shared a file`
                    case "msg-share-event":
                        return ` shared an event`                        
                    case "msg-daily-checkin":
                        return ` checked-in to the daily goal`
                    case "msg-deleted":
                        return "(deleted message)"
                    case "msg-system-group-creation":
                        return `New group!`
                    case "msg-system-group-icon-change":
                        return `An Islander changed the Island icon`
                    case "msg-system-member-joined":
                        return `An Islander joined the group`
                    case "msg-system-group-info-change":
                    case "msg-system-member-left":
                    case "msg-system-member-role-change":                        
                    case "msg-system-new-event":
                        return `An Islander${JSON.parse(this.room.latestMessage.content).update}`
                }
            },
            latestMessageExists: function() {
                if (this.room.latestMessage == undefined) {
                    return false;
                } else {
                    return true;
                }
            },
            previewData: function() {
                if (this.room.privacy == 'personal') {
                    for (let member of this.room.memberData) {
                        if (member.member_id != this.userInfo.id) {
                            return {
                                icon: member.islander_icon,
                                name: member.nickname
                            }
                        }
                    }
                } else {
                    return {
                        icon: this.room.chatroom_icon,
                        name: this.room.name
                    }
                }
            }
        }
    })


Vue.component('current-chatroom-container', {
    props: [
        'chatroomInfo', 
        'chatroomMemberList', 
        'messageData', 
        'chatroomEvents',
        'userRooms',
        'sharingEvent',
        'userInfo',
        'memberData'
    ],
    template: `
    <div>
        <div class='current-chatroom'>
            <component
                v-bind:is='$root.currentChatroomTopNavStyle'
                v-bind:chatroom-info='chatroomInfo'
                v-bind:chatroom-member-list='chatroomMemberList'
                v-bind:memberData='memberData'
                v-bind:userInfo='userInfo'>
            </component>

            <transition name="component-fade" mode="out-in">
                <large-overlay
                    v-bind:chatroom-info='chatroomInfo'
                    v-bind:chatroom-events='chatroomEvents'
                    v-bind:user-rooms='userRooms'
                    v-bind:sharing-event='sharingEvent'
                    v-bind:member-data='memberData'
                    v-bind:user-info='userInfo'>
                </large-overlay>
            </transition>
            
            <current-chatroom-sticky
                v-bind:chatroom-info='chatroomInfo'
                v-bind:user-info='userInfo'>
            </current-chatroom-sticky>

            <transition name="component-fade" mode="out-in">
                <current-chatroom-overlay>
                </current-chatroom-overlay>
            </transition>
            
            <current-chatroom-msg
                v-bind:message-data="messageData">
            </current-chatroom-msg>

            <transition name="component-fade" mode="out-in">
                <emoji-selector
                    v-if="$root.emojiSelectorVisible">
                </emoji-selector>
            </transition>

            <div class='current-chatroom-input'>
                <div class='input-container'>
                    <div class='text-input-wrapper'>
                        <div class='input-box-background'>
                            <textarea id='input-box'
                                placeholder="Type a message"
                                v-on:input="$root.handleInput"
                                v-on:keydown="$root.specialKeyPress($event)"
                                v-on:keyup="$root.shiftReleased($event)">
                            </textarea>
                            <i class="far fa-smile-wink" id='add-emoticon-icon'
                                v-on:click="$root.toggleEmojiSelector">
                            </i>
                        </div>
                    </div>
                    <div class='icons'
                        id='icons-normal'>
                        <div class='send-message'
                            v-on:click="$root.postMessage">
                            <i class="far fa-paper-plane"></i>
                        </div>
                        <form class='image-form'>
                            <label for='upload-image'>
                                <div class="label-icon"
                                    v-on:click="$root.swapOverlay('overlay-upload-image')">
                                    <i class="far fa-images" id='upload-image-icon'></i>
                            </div>
                            </label>
                            <input type='file' class='hidden' multiple='true'
                                id='upload-image' name='image-attachment'
                                accept='image/*'
                                v-on:change="$root.logSelectedImages($event)">
                        </form>
                        <form class='file-form'>
                            <label for='upload-file'>
                                <div class="label-icon"
                                    v-on:click="$root.swapOverlay('overlay-upload-file')">
                                    <i class="fas fa-paperclip" id='upload-file-icon'></i>
                            </div>
                            </label>
                            <input type='file' class='hidden'
                                id='upload-file' name='file-attachment'
                                v-on:change="$root.logSelectedFiles($event)">
                            <iframe class='hidden file-downloader'></iframe>
                        </form>
                    </div>
                    <div class='hidden icons'
                        id='icons-in-overlay'>
                        <div class='send-message'
                            v-on:click="$root.postMessage">
                            <i class="far fa-paper-plane"></i>
                        </div>
                        <form class='image-form'>
                            <div class="label-icon"
                                v-on:click="$root.unloadAttachments">
                                <i class="fas fa-times" id='close-overlay-icon'></i>
                            </div>
                        </form>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
})

