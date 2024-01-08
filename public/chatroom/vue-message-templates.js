//  vue-message-templates.js
//  Contains the message templates used in Island
//  To refactor messages, check out vue's guide on how to display filtered results in v-for components
//  https://vuejs.org/v2/guide/list.html#Displaying-Filtered-Sorted-Results

//  Message types:
//  "msg-plaintext"
//  "msg-image-attached"
//  "msg-file-attached"
//  "msg-share-event"
//  "msg-daily-checkin"
//  "msg-deleted"
//  "msg-system-notif"
//  "msg-system-datemarker"
//  "msg-system-group-creation"
//  "msg-system-group-icon-change"
//  "msg-system-group-info-change"
//  "msg-system-member-joined"
//  "msg-system-member-left"
//  "msg-system-member-role-change"
//  "msg-system-new-event"

//  TODO:
//  "msg-system-new-personal-chatroom"


//  Methods used by components on this file
const addEmoji = (evt) => {
    if (!evt.target.classList.contains("emoji-button-clickable")) {
        return;
    } else {
        const inputBox = document.getElementById('input-box');
        if (inputBox.selectionStart) {
            const startPos = inputBox.selectionStart;
            const endPos = inputBox.selectionEnd;
            inputBox.value = inputBox.value.substring(0, startPos)
                + evt.target.innerHTML.trim();
                + inputBox.value.substring(endPos, inputBox.value.length);
        } else {
            inputBox.value += evt.target.innerHTML.trim();
        }
        evt.stopPropagation();
    }
}

const matchesQueryResult = (query, name) => {
    if (query == "") {
        return true;
    } else {
        return query.test(name);
    }
}

const getFile = async (room, filename) => {
    document.querySelector('.file-downloader').src = `/file/room/${room}/filename/${filename}`;
}

//  Message display
Vue.component('current-chatroom-msg', {
    props: ['messageData'],
    template: `
    <div class='msg-display-box' ref='display'
        v-on:scroll="$root.getMessagesOnScroll">
        <component 
            v-for="message in messages" 
            v-bind:is="message.type" 
            v-bind:key="message.id"
            v-bind="message">
        </component>
    </div>
    `,
    updated() {
        this.$nextTick(function () {
            /*let isSelf = new RegExp ('self', 'i')
            if (this.messages[this.messages.length - 1]) {
                if (isSelf.test(this.messages[this.messages.length - 1].position)) {*/
                    this.$refs.display.scrollTop = this.$refs.display.scrollHeight
                /*}
            }*/
        })
    },
    computed: {
        messages: function () {
            let res = [];
            for (let message of this.messageData) {
                res.push(message);
            }
            // res = parseSysnotifContent(res)
            res = convertToLocaleTimezone(res)
            res = addDateMarkers(res)
            res = refactorMessageBubbles(res)
            return res;
        },
    }
})

//  Emoji selector
Vue.component('emoji-selector', {
    template: `
    <div class='emoji-selector unselectable'
        v-on:click='addEmoji($event)'>
        <div class='emoji-search-bar-container'>
            <input class='emoji-search-bar' type='text' placeholder='Search for an emoji...'
                v-model='queryString'>
        </div>
        <div class='emoji-buttons'>
            <emoji-button
                v-for="emoji in emojiList"
                v-bind:key="emoji.id"
                v-bind:emoji="emoji"
                v-bind:query="query">
            </emoji-button>
        </div>
    </div>`,
    data() {
        return {
            emojiList: [
                { 'id': 128512, 'emoji': "😀", 'name': 'GRINNING FACE' },
                { 'id': 128513, 'emoji': "😁", 'name': 'GRINNING FACE WITH SMILING EYES' },
                { 'id': 128514, 'emoji': "😂", 'name': 'FACE WITH TEARS OF JOY' },
                { 'id': 128515, 'emoji': "😃", 'name': 'SMILING FACE WITH OPEN MOUTH' },
                { 'id': 128516, 'emoji': "😄", 'name': 'SMILING FACE WITH OPEN MOUTH AND SMILING EYES' },
                { 'id': 128517, 'emoji': "😅", 'name': 'SMILING FACE WITH OPEN MOUTH AND COLD SWEAT' },
                { 'id': 128518, 'emoji': "😆", 'name': 'SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES' },
                { 'id': 128519, 'emoji': "😇", 'name': 'SMILING FACE WITH HALO' },
                { 'id': 128520, 'emoji': "😈", 'name': 'SMILING FACE WITH HORNS' },
                { 'id': 128521, 'emoji': "😉", 'name': 'WINKING FACE' },
                { 'id': 128522, 'emoji': "😊", 'name': 'SMILING FACE WITH SMILING EYES' },
                { 'id': 128523, 'emoji': "😋", 'name': 'FACE SAVOURING DELICIOUS FOOD' },
                { 'id': 128524, 'emoji': "😌", 'name': 'RELIEVED FACE' },
                { 'id': 128525, 'emoji': "😍", 'name': 'SMILING FACE WITH HEART-SHAPED EYES' },
                { 'id': 128526, 'emoji': "😎", 'name': 'SMILING FACE WITH SUNGLASSES' },
                { 'id': 128527, 'emoji': "😏", 'name': 'SMIRKING FACE' },
                { 'id': 128528, 'emoji': "😐", 'name': 'NEUTRAL FACE' },
                { 'id': 128529, 'emoji': "😑", 'name': 'EXPRESSIONLESS FACE' },
                { 'id': 128530, 'emoji': "😒", 'name': 'UNAMUSED FACE' },
                { 'id': 128531, 'emoji': "😓", 'name': 'FACE WITH COLD SWEAT' },
                { 'id': 128532, 'emoji': "😔", 'name': 'PENSIVE FACE' }, 
                { 'id': 128533, 'emoji': "😕", 'name': 'CONFUSED FACE' },
                { 'id': 128534, 'emoji': "😖", 'name': 'CONFOUNDED FACE' },
                { 'id': 128535, 'emoji': "😗", 'name': 'KISSING FACE' },
                { 'id': 128536, 'emoji': "😘", 'name': 'FACE THROWING A KISS' },
                { 'id': 128537, 'emoji': "😙", 'name': 'KISSING FACE WITH SMILING EYES' },
                { 'id': 128538, 'emoji': "😚", 'name': 'KISSING FACE WITH CLOSED EYES' },
                { 'id': 128539, 'emoji': "😛", 'name': 'FACE WITH STUCK- OUT TONGUE'},
                { 'id': 128540, 'emoji': "😜", 'name': 'FACE WITH STUCK - OUT TONGUE AND WINKING EYE' },
                { 'id': 128541, 'emoji': "😝", 'name': 'FACE WITH STUCK - OUT TONGUE AND TIGHTLY - CLOSED EYES' },
                { 'id': 128542, 'emoji': "😞", 'name': 'DISAPPOINTED FACE' },
                { 'id': 128543, 'emoji': "😟", 'name': 'WORRIED FACE' },
                { 'id': 128544, 'emoji': "😠", 'name': 'ANGRY FACE' },
                { 'id': 128545, 'emoji': "😡", 'name': 'POUTING FACE' },
                { 'id': 128546, 'emoji': "😢", 'name': 'CRYING FACE' },
                { 'id': 128547, 'emoji': "😣", 'name': 'PERSEVERING FACE' },
                { 'id': 128548, 'emoji': "😤", 'name': 'FACE WITH LOOK OF TRIUMPH' },
                { 'id': 128549, 'emoji': "😥", 'name': 'DISAPPOINTED BUT RELIEVED FACE' },
                { 'id': 128550, 'emoji': "😦", 'name': 'FROWNING FACE WITH OPEN MOUTH' },
                { 'id': 128551, 'emoji': "😧", 'name': 'ANGUISHED FACE' },
                { 'id': 128552, 'emoji': "😨", 'name': 'FEARFUL FACE' },
                { 'id': 128553, 'emoji': "😩", 'name': 'WEARY FACE' },
                { 'id': 128554, 'emoji': "😪", 'name': 'SLEEPY FACE' },
                { 'id': 128555, 'emoji': "😫", 'name': 'TIRED FACE' },
                { 'id': 128556, 'emoji': "😬", 'name': 'GRIMACING FACE' },
                { 'id': 128557, 'emoji': "😭", 'name': 'LOUDLY CRYING FACE' },
                { 'id': 128558, 'emoji': "😮", 'name': 'FACE WITH OPEN MOUTH' },
                { 'id': 128559, 'emoji': "😯", 'name': 'HUSHED FACE' },
                { 'id': 128560, 'emoji': "😰", 'name': 'FACE WITH OPEN MOUTH AND COLD SWEAT' },
                { 'id': 128561, 'emoji': "😱", 'name': 'FACE SCREAMING IN FEAR' },
                { 'id': 128562, 'emoji': "😲", 'name': 'ASTONISHED FACE' },
                { 'id': 128563, 'emoji': "😳", 'name': 'FLUSHED FACE' },
                { 'id': 128564, 'emoji': "😴", 'name': 'SLEEPING FACE' },
                { 'id': 128565, 'emoji': "😵", 'name': 'DIZZY FACE' },
                { 'id': 128566, 'emoji': "😶", 'name': 'FACE WITHOUT MOUTH '}, 
                { 'id': 128567, 'emoji': "😷", 'name': 'FACE WITH MEDICAL MASK' } 
            
            ],
            queryString: ""
        }
    },
    computed: {
        query: function() {
            if (this.queryString == "") {
                return ""
            } else {
                let pattern = new RegExp(this.queryString, "i");
                return pattern;
            }
        }
    },
    methods: {
        addEmoji
    }
}) 

Vue.component('emoji-button', {
    props: [
        'emoji',
        'query'
    ],
    template:`
    <span class='emoji-button-clickable'
        v-bind:title='emoji.name'
        v-if='matchesQueryResult(query, emoji.name)'>
        {{ emoji.emoji }}
    </span>
    `,
    methods: {
        matchesQueryResult
    }
})


//  Message options
Vue.component('msg-options', {
    props: {
        user: Number,
        msg: Number,
        type: String,
        eventid: Number
    },
    template: `
    <div class='message-options'>
        <div class='message-delete-button'  
            title='Delete message'
            v-if="$root.isAdmin || user==$root.userInfo.id"
            v-on:click="$root.deleteMessage(msg, $root.currRoomID)">
            <i class="fas fa-trash"></i>
        </div>
        <div class='member-profile-button'
            title='View profile'>
            <a v-bind:href='memberProfileLink'>
                <i class="fas fa-user"></i>
            </a>
        </div>
        <div class='add-event-button'
            title='Add event to group calendar'
            v-if='type == "msg-share-event"'
            v-on:click='addEventToGroupCalendar($root.currRoomID, eventid)'>
            <i class="fas fa-calendar-plus"></i>
        </div>
    </div>
    `,
    data() {
        return {
            memberID: this.user
        }
    },
    computed: {
        memberProfileLink: function() {
            return '/userProfile.html?islander=' + encodeURIComponent(this.memberID)
        }
    },
    methods: {
        addEventToGroupCalendar: async function (room, event) {
            await fetch (`/calendar/${room}/${event}`, {
                method: "POST"
            })
        }
    }
})


//  User message templates
Vue.component('msg-plaintext', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        time: String,
        date: String,
        position: String,   //  "self" | "other"
        linkedcontentid: String
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'
            v-on:click="toggleMessageOptions">
            <msg-options 
                v-if='messageOptionsVisible'
                v-bind:msg='id'
                v-bind:user='sender'
                v-bind:key='id + 0.001'>
            </msg-options>
            <h5>{{ $root.chatroomMembers.get(sender) }}</h5>
            <span class='content-wrapper'> 
                {{content}}
            </span>
        </div>    
        <div class='time'>
            {{ time }}
        </div>   
    </div>
    `, 
    data() {
        return {
            messageOptionsVisible: false
        }
    },
    methods: {
        toggleMessageOptions: function() {
            this.messageOptionsVisible = !this.messageOptionsVisible
        }
    }
})

Vue.component('msg-image-attached', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        time: String,
        date: String,
        position: String,   //  "self" | "other"
        linkedcontentid: String,
        attachments: Array
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'
            v-on:click="toggleMessageOptions">
            <msg-options 
                v-if='messageOptionsVisible'
                v-bind:msg='id'
                v-bind:user='sender'
                v-bind:key='id + 0.001'>
            </msg-options>
            <h5>{{ $root.chatroomMembers.get(sender) }}</h5>  
            <div class='img-wrapper unselectable'>
                <div class='view-image-attachments' 
                    v-if='attachments.length > 1'
                    v-on:click='viewImageAttachments($event, attachments)'>
                        <i class="far fa-images"></i>
                        +{{ attachments.length - 1 }}
                </div>
                <img v-bind:src="attachments[0]['attached_file']">        
            </div>
            <span class='content-wrapper'>    
                {{content}}
            </span>
        </div>
        <div class='time'>
            {{ time }}
        </div>
    </div>
    `, 
    data() {
        return {
            messageOptionsVisible: false
        }
    },
    methods: {
        toggleMessageOptions: function() {
            this.messageOptionsVisible = !this.messageOptionsVisible
        },
        viewImageAttachments: function(evt, attachments) {
            evt.stopPropagation()
            app.loadedAttachments = attachments;
            swapOverlay('overlay-view-image-attachments')
        }
    }
}) 

Vue.component('msg-file-attached', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        time: String,
        date: String,
        position: String,   //  "self" | "other"
        linkedcontentid: String,
        attachments: Array
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'
            v-on:click="toggleMessageOptions">
            <msg-options 
                v-if='messageOptionsVisible'
                v-bind:msg='id'
                v-bind:user='sender'
                v-bind:key='id + 0.001'>
            </msg-options>
            <h5>{{ $root.chatroomMembers.get(sender) }}</h5>  
            <div class='file-wrapper unselectable'
                v-on:click="getFile($root.currRoomID, attachments[0]['attached_file'])">
                <i class="far fa-file-alt"></i>{{ attachments[0]['attached_file'] }}
            </div>
            <span class='content-wrapper'>    
                {{content}}
            </span>
        </div>
        <div class='time'>
            {{ time }}
        </div>
    </div>
    `, 
    data() {
        return {
            messageOptionsVisible: false
        }
    },
    methods: {
        toggleMessageOptions: function() {
            this.messageOptionsVisible = !this.messageOptionsVisible
        },
        getFile
    }
}) 

Vue.component('msg-share-event', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        time: String,
        date: String,
        eventinfo: {
            id: Number,
            name: String,
            date: String,
            time: String,
            starting_datetime: String, 
            description: String
        },
        position: String,   //  "self" | "other"
        linkedcontentid: String
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'
            v-on:click="toggleMessageOptions">
            <msg-options 
                v-if='messageOptionsVisible'
                v-bind:msg='id'
                v-bind:user='sender'
                v-bind:type='type'
                v-bind:eventid='eventinfo.id'
                v-bind:key='id + 0.001'>
            </msg-options>
            <h5>{{ $root.chatroomMembers.get(sender) }}</h5>  
            <div v-bind:class='eventPreviewStyle'
                v-on:click='toggleEventPreviewMode'>
                <h4> {{ eventinfo.name }} </h4>
                {{ eventinfo.date }}</br>
                {{ eventinfo.time.substring(0,5) }}</br>
                <span
                    v-if="eventPreviewExpanded">
                    <div class='form-element-bar'></div>
                    <div class='event-description-text'>
                        {{ eventinfo.description }}
                    </div>
                </span> 
            </div>
            <span class='content-wrapper'>
                {{content}}
            </span>
        </div>
        <div class='time'>
            {{ time }}
        </div>
    </div>
    `,
    data() {
        return {
            eventPreviewExpanded: false,
            eventPreviewStyle: 'in-message calendar-event-wrapper',
            messageOptionsVisible: false
        }
    },  
    methods: {
        toggleEventPreviewMode: function () {
            this.eventPreviewExpanded = !this.eventPreviewExpanded;
            if (this.eventPreviewExpanded) {
                this.eventPreviewStyle = 'expanded in-message calendar-event-wrapper';
            } else {
                this.eventPreviewStyle = 'in-message calendar-event-wrapper';
            }
        },
        toggleMessageOptions: function() {
            this.messageOptionsVisible = !this.messageOptionsVisible
        }
    }
})

Vue.component('msg-daily-checkin', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        time: String,
        date: String,
        checkininfo: {
            id: Number,
            content: String
        },
        position: String,   //  "self" | "other"
        linkedcontentid: String
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'
            v-on:click="toggleMessageOptions">
            <msg-options 
                v-if='messageOptionsVisible'
                v-bind:msg='id'
                v-bind:user='sender'
                v-bind:key='id + 0.001'>
            </msg-options>
            <span class='content-wrapper'>
                <strong>{{ $root.chatroomMembers.get(sender) }} has checked-in to "{{ checkininfo.content }}"!</strong>
            </span>
        </div>
        <div class='time'>
            {{ time }}
        </div>
    </div>
    `, 
    data() {
        return {
            messageOptionsVisible: false
        }
    },
    methods: {
        toggleMessageOptions: function() {
            this.messageOptionsVisible = !this.messageOptionsVisible
        }
    }
})

Vue.component('msg-deleted', {
    props: {
        id: Number,
        sender: Number,
        type: String,
        time: String,
        date: String,
        position: String, 
    },
    template: `
    <div v-bind:class='position + " msg"'>
        <div class='bubble'>
            <span class='content-wrapper deleted-message'> 
                <i class="fas fa-ban"></i>This message has been deleted.
            </span>
        </div>    
        <div class='time'>
            {{ time }}
        </div>   
    </div>
    `
})


//  System message templates
/*  Vue.component('msg-system-notif', {
    props: {
        id: Number,
        sender: Number,
        content: String,
        type: String,
        timeHour: Number,
        timeMinute: Number,
        position: String,   //  not applicable in system notifications
        otherInfo: String
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{content}}
        </div>
    </div>
    `
}) */

//  TODO
Vue.component('msg-system-datemarker', {
    props: {
        id: Number,
        date: String,
        type: String   
    },
    
    //  TODO: template and CSS styling
    template: `
    <div class='sys-time-marker msg'>
        <div class='bubble'>
            {{ date }}
        </div>
    </div>
    `
}) 

Vue.component("msg-system-group-creation", {
    props: {
        id: Number,
        content: { 
            "creator-id": Number 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['creator-id']) }} created this group.
        </div>
    </div>
    `
})

Vue.component("msg-system-group-icon-change", {
    props: {
        id: Number,
        content: { 
            "initiator-id": Number 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['initiator-id']) }} changed the Island icon.
        </div>
    </div>
    `
})

Vue.component("msg-system-group-info-change", {
    props: {
        id: Number,
        content: { 
            "initiator-id": Number,
            "update": String 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['initiator-id']) }} {{ content.update }}
        </div>
    </div>
    `
})

Vue.component("msg-system-member-joined", {
    props: {
        id: Number,
        content: { 
            "new-member-id": Number,
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['new-member-id']) }} joined the group.
        </div>
    </div>
    `
})

Vue.component("msg-system-member-left", {
    props: {
        id: Number,
        content: { 
            "member-id": Number,
            "update": String 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['member-id']) }} {{ content.update }}
        </div>
    </div>
    `
})

Vue.component("msg-system-member-role-change", {
    props: {
        id: Number,
        content: { 
            "member-id": Number,
            "update": String 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['member-id']) }} {{ content.update }}
        </div>
    </div>
    `
})

Vue.component('msg-system-new-event', {
    props: {
        id: Number,
        content: { 
            "initiator-id": Number,
            "update": String 
        },
        type: String,
        timestamp: String        
    },
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            {{ $root.chatroomMembers.get(content['initiator-id']) }} {{ content.update }}
        </div>
    </div>
    `
})

Vue.component('msg-system-new-personal-chatroom', {
    template: `
    <div class='sysnotif msg'>
        <div class='bubble'>  
            This is the beginning of your conversation. Say hi! 
        </div>
    </div>
    `
})