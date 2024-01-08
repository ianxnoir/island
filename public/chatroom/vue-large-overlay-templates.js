//  Methods used by components on this file
const updateChatroomInfo = async (originalInfo, updatedInfo, stickyInfo) => {
    //check to see whether you need to update the chatroom table, sticky_message table or both
    if (originalInfo.sticky_content != stickyInfo.content ||
        originalInfo.sticky_check_in != stickyInfo.check_in) {
            postSticky(originalInfo.id, stickyInfo)
        }
    await fetch(`/chatroom/${originalInfo.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedInfo)
    })
    swapOverlayLarge('large-overlay-chatroom-info');
    app.stickyDisplayMode = 'sticky-message-hidden'
}

const postSticky = async (room, stickyInfo) => {
    await fetch(`chatroom/sticky/${room}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(stickyInfo)        
    }) 
}

const postEvent = async (eventInfo) => {
    let date = eventInfo.date.split('-')
    let time = eventInfo.time.split(':')
    eventInfo.datetime = new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], 0));

    const res = await fetch ('/event', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventInfo)
    })
    const json = await res.json()
    if (json.success) {
        app.sharingEvent = json.newEventID;
        swapOverlayLarge('large-overlay-create-event-success');
    }
    getChatroomEvents(app.currRoomID);
}

//  call postMessage using the roomID of target room and event ID of current event. Use template "msg-share-event"

Vue.component('large-overlay', {
    props: ['chatroomInfo', 'chatroomEvents', 'userRooms', 'sharingEvent', 'memberData', 'userInfo'],
    template: `
    <component class='large overlay'
        v-bind:is="$root.currentOverlayLarge" 
        v-bind:chatroom-info='chatroomInfo'
        v-bind:chatroom-events='chatroomEvents'
        v-bind:user-rooms='userRooms'
        v-bind:sharing-event="sharingEvent"
        v-bind:member-data='memberData'
        v-bind:user-info='userInfo'>            
    </component>
    `
})

Vue.component('large-overlay-edit-chatroom-info', {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'> 
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend">Island Info</legend>

            <div class="overlay-form-element">
                <label class="form-element-label" for="chatroom-name">Island Name</label>
                <input name='chatroom-name' 
                    class="form-element-field" 
                    type="text" 
                    required maxlength='30'
                    v-model="updatedInfo.name"
                    v-on:input='checkNameLength($event)'/>
                <div class="form-element-bar">
                <span id='name-length-prompt'
                    style='opacity: 0; color: var(--time-button); transition: 0.2s all; font-size: 12px;'>
                    *Island name must be 30 characters or below
                </span>
                </div>
            </div>
            
            <div class="overlay-form-element">
                <label for='chatroom-interests' class='form-element-label'>Group tags:</label>
                <div class='chatroom-interests-tags'>
                <label for='1' class='form-radio-label'>   
                    <input name="chatroom-interests" type="checkbox" 
                        v-model="updatedInfo.interests" 
                        value="1" id="1">
                    Art
                </label>
                <label for='2' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                        v-model="updatedInfo.interests" 
                        value="2" id="2">
                    Music
                </label>
                <label for='3' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                    v-model="updatedInfo.interests" 
                    value="3" id="3">
                    Coding
                </label>
                <label for='4' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                    v-model="updatedInfo.interests" 
                    value="4" id="4">
                    Cooking
                </label>
                <label for='5' class='form-radio-label'>        
                    <input name="chatroom-interests" type="checkbox" 
                    v-model="updatedInfo.interests" 
                    value="5" id="5">
                    Books
                </label>
                <label for='6' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                    v-model="updatedInfo.interests" 
                    value="6" id="6">
                    Dancing
                </label>
                <label for='7' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                        v-model="updatedInfo.interests" 
                        value="7" id="7">
                    Movies
                </label>
                <label for='8' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                        v-model="updatedInfo.interests" 
                        value="8" id="8">
                    Fine Art
                </label>
                <label for='9' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox"
                        v-model="updatedInfo.interests" 
                        value="9" id="9">
                    Writing
                </label>
                <label for='10' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox"
                        v-model="updatedInfo.interests" 
                        value="10" id="10">
                    Yoga
                </label>
                <label for='11' class='form-radio-label'>
                    <input name="chatroom-interests" type="checkbox" 
                        v-model="updatedInfo.interests" 
                        value="11" id="11">
                    Sports
                </label>
                </div>
            </div>

            <div class="overlay-form-element">
                <label for='chatroom-privacy' class='form-element-label'>
                    This island is:
                </label>

                <span>
                    <input name='chatroom-privacy'
                        id='public' value='public' 
                        class="form-radio-field" type="radio"
                        v-model='updatedInfo.privacy'/>    
                    <label for="public" class="form-radio-label">
                        Public
                    </label>
                </span>

                <span>
                    <input name='chatroom-privacy' 
                        id='protected' value='protected' 
                        class="form-radio-field" type="radio"
                        v-model='updatedInfo.privacy'/>
                    <label for="protected" class="form-radio-label">
                        Protected
                    </label>
                </span>

                <span>
                    <input name='chatroom-privacy' 
                        id='private' value='private' 
                        class="form-radio-field" type="radio"
                        v-model='updatedInfo.privacy'/>
                    <label for="private" class="form-radio-label">
                        Private
                    </label>
                </span>

            </div>

            <div class="overlay-form-element">
                <span class='form-element-label'>Sticky message:</span>
                <textarea name="chatroom-description" class="form-element-field overlay-form-textarea" 
                    v-bind:placeholder='stickyInfo.content'
                    v-model='stickyInfo.content'></textarea>

                <div class='overlay-form-element overlay-form-element-split-content'>
                    
                    <label for='require-checkin' class="form-radio-label">
                        Check-in required: </br>
                    </label>
                        <span>
                            <input name='require-checkin'
                                id='checkin-none'
                                value='none' 
                                class="form-radio-field" type="radio"
                                v-model='stickyInfo.check_in'/>    
                            <label for='checkin-none' class="form-radio-label">
                                None
                            </label>
                        </span>
                        <span>
                            <input name='require-checkin'
                                id='checkin-daily'
                                value='daily' 
                                class="form-radio-field" type="radio"
                                v-model='stickyInfo.check_in'/>
                            <label for='checkin-daily' class="form-radio-label">
                                Daily
                            </label>
                        </span>
                    
                </div>
                <div class="form-element-bar">
                </div>
            </div>

            <div class="overlay-form-element">
                <span class='form-element-label'>Island description:</span>
                <textarea name="chatroom-description" class="form-element-field overlay-form-textarea" 
                    v-bind:placeholder='chatroomInfo.description'
                    v-model='updatedInfo.description'></textarea>
                <div class="form-element-bar">
                </div>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn-cancel -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-chatroom-info')">
                    Cancel
                </button>
                <button class="form-btn"
                    v-on:click="updateChatroomInfo(chatroomInfo, updatedInfo, stickyInfo)">
                    Save
                </button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            updatedInfo: {
                'chatroom-id': this.chatroomInfo.id,
                'name': this.chatroomInfo.name,
                'interests': this.chatroomInfo.chatroomInterests,
                'description': this.chatroomInfo.description,
                'privacy': this.chatroomInfo.privacy,
                'interests': this.chatroomInfo.chatroomInterests
            },
            stickyInfo: {
                'content': this.chatroomInfo.sticky_content,
                'check_in': this.chatroomInfo.sticky_check_in
            }
        }
    },
    methods: {
        updateChatroomInfo,
        checkNameLength: function (evt) {
            const prompt = document.getElementById('name-length-prompt')
            if (evt.target.value.length == 30) {
                prompt.style.opacity = "1";
            }
        }
    }
})

Vue.component('large-overlay-chatroom-info', {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend">Island Info</legend>
            <form id='avatar-upload' class="avatar-upload">
                <div class="avatar-edit">
                    <input type='file' id="imageUpload" name='image-upload' accept=".png, .jpg, .jpeg" 
                        v-on:change='readURL($event)'/>
                    <label for="imageUpload">
                        <i class="far fa-edit"></i>
                    </label>
                </div>
                <div class="avatar-preview"> 
                    <div id="imagePreview">  
                    </div>
                </div>
                <div class="avatar-save"
                    v-if="saveIconButtonVisible"
                    v-on:click='saveChatroomIcon'>
                    <i class="far fa-save"></i>
                </div>
            </form>

            <div class="overlay-form-element">
                <div class="form-element-label">Island Name</div>
                <div class="form-element-field">{{ chatroomInfo.name }}</div>
            </div>
            
            <div class="overlay-form-element">
                <label for='chatroom-interests' class='form-element-label'>Group tags:</label>
                <div class='chatroom-interests-tags'>    
                    <interest-tag
                        v-for="interest of chatroomInfo.chatroomInterests"
                        v-bind:key="interest"
                        v-bind:name="$root.fullInterestsList.get(interest)"
                        v-bind:interestID="interest">
                    </interest-tag>
                </div>
            </div>

            <div class="overlay-form-element">
                <label for='chatroom-privacy' class='form-element-label'>
                    Privacy
                </label>

                <span>
                    {{ chatroomInfo.privacy }}
                </span>
                <div class="form-element-bar"></div>
            </div>

            <div class="overlay-form-element">
                <label class='form-element-label'>
                    Sticky message
                </label>

                <span>
                    {{ chatroomInfo.sticky_content }}
                </span>
                <div class="form-element-bar"></div>
            </div>

            <div class="overlay-form-element">
                <span class='form-element-label'>Island description:</span>
                {{ chatroomInfo.description }}
                <div class="form-element-bar"></div>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn-cancel -nooutline" type="reset"
                    v-if='$root.isAdmin'
                    v-on:click="$root.swapOverlayLarge('large-overlay-edit-chatroom-info')">Edit</button>
                <button class="form-btn"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">Back to group</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            iconPreviewLoaded: false,
            saveIconButtonVisible: false,
            chatroomIconPreview: this.chatroomInfo.chatroom_icon
        }
    },
    mounted: function () {   
        let imagePreview = document.getElementById('imagePreview');    
        let imagePreviewBackground;
        if (this.chatroomInfo.chatroom_icon == null || this.chatroomInfo.chatroom_icon == "none") {
            imagePreviewBackground = 'https://upload.wikimedia.org/wikipedia/commons/3/30/Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg';
        } else {
            imagePreviewBackground = this.chatroomIconPreview;
        }
        imagePreview.style.backgroundImage = 'url(' + imagePreviewBackground + ')'
    },
    methods: {
        readURL: function(evt) {
            let imagePreview = document.getElementById('imagePreview');
            let input = evt.target;
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                this.saveIconButtonVisible = true;
                reader.onload = function(evt) {
                    this.chatroomIconPreview = evt.target.result;
                    this.iconPreviewLoaded = true;
                    imagePreview.style.backgroundImage = 'url(' + evt.target.result + ')'
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                imagePreview.style.backgroundImage = 'url(' + this.chatroomInfo.chatroom_icon + ')'
                this.iconPreviewLoaded = false;
                this.saveIconButtonVisible = false;
            }
        },
        saveChatroomIcon: async function() {
            let body = new FormData(document.getElementById('avatar-upload'))
            await fetch(`/chatroom/${this.chatroomInfo.id}`, {
                method: "PUT",
                body: body
            });
            this.saveIconButtonVisible = false;
        }
    }
})
/*    Vue.component('', {

    })*/

    Vue.component('interest-tag', {
        props: {
            interestID: Number,
            name: String
        },
        template: `
        <div class='chatroom-interest-tag'>
            {{ name }}
        </div>
        `
    })

Vue.component('large-overlay-create-event', {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend"
                v-if='chatroomInfo.privacy != "personal"'>Create an Event for {{ chatroomInfo.name }}</legend> 
            <legend class="form-legend"
                v-else>Create an Event</legend>
            
            <div class="overlay-form-element">
                <label class="form-element-label" for="event-name">Event Name</label>
                <input name='event-name' 
                    class="form-element-field" 
                    type="input" 
                    v-model="eventInfo.name"
                    required/>
                <div class="form-element-bar"></div>
            </div>
            
            <div class="overlay-form-element">
                <span class='form-element-label'>Event date and time:</span>
                <div class="overlay-form-element-split-content">
                    <input type='date' 
                        class='form-element-field' 
                        v-model="eventInfo.date"
                        required/>
                    <input type="time" 
                        class='form-element-field' 
                        v-model="eventInfo.time">
                </div>
                <div class="form-element-bar"></div>
            </div>

            <div class="overlay-form-element">
                <span class='form-element-label'>Event description:</span>
                <textarea name="event-description" 
                    class="form-element-field overlay-form-textarea" 
                    placeholder=""
                    v-model="eventInfo.description">
                </textarea>
                <div class="form-element-bar"></div>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn-cancel -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">Cancel</button>
                <button class="form-btn" v-on:click='postEvent(eventInfo)'>Create</button>
            </div>
        </div>
    </div>    
    `,
    data() {
        return {
            eventInfo: {
                chatroomID: this.chatroomInfo.id,
                name: "New Event",
                date: `2020-12-31`,
                time: "00:00",
                description: ""
            },
            currentDate: new Date()
        }
    },
    computed: {
        currentDay: function() {
            return this.currentDate.getDate()
        },
        currentMonth: function() {
            return this.currentDate.getMonth()
        },
        currentYear: function() {
            return this.currentDate.getFullYear()
        }
    },
    methods: {
        postEvent
    }
})

    Vue.component('large-overlay-create-event-success', {
        props: ['chatroomInfo'],
        template: `
        <div>
            <div class='overlay-main-container'>
                <div class='overlay-quick-access-options'
                    v-on:click="$root.returnToPreviousOverlayLarge">
                    <i class="fas fa-undo-alt"></i> Back
                </div>
                <legend class="form-legend">Your event has been created!</legend>     
                Your event has been added to your Island's calendar. Let your friends know to join the fun!

                <div class='form-actions'>
                    <button class="form-btn"
                        v-on:click="$root.shareEvent($root.sharingEvent)">
                        Share Event
                    </button>
                    <button class="form-btn"
                        v-on:click="$root.swapOverlayLarge('large-overlay-chatroom-calendar')">
                        View Island calendar
                    </button>
                </div>
                <div class='form-actions'>
                    <button class="form-btn-cancel -nooutline"
                        v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                        Back to Island
                    </button>
                </div>  
            </div>
        </div>
        `
    })

Vue.component("large-overlay-manage-members", {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend">Islanders @ {{ chatroomInfo.name }}</legend>

            <div class="overlay-form-element">
                <div> Add Islanders to <span style="font-weight: bolder;">{{ chatroomInfo.name }}</span>: </div>
            </div>

            <div class="overlay-form-element overlay-form-element-split-content">
                <button class="overlay-button-small"
                    v-on:click="getChatroomInviteLink">
                    Generate invite link
                </button>
                <input id="island-invite-link" 
                    readonly
                    v-on:click='copyToClipboard'    
                    v-model='inviteLink'>
                <label class='form-element-label'
                    for='island-invite-link'
                    style='margin-left: 5px; font-size: 24px;'>
                    <i class="far fa-copy"></i>
                </label>
            </div>

            <div class="overlay-form-element">
                <overlay-islander-card
                    v-for="member in chatroomInfo.chatroomMembers"
                    v-bind:key="member.member_id"
                    v-bind="member">
                </overlay-islander-card>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                    Back to group
                </button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            inviteLinkPending: false,
            inviteLink: ""
        }
    },
    methods: {
        getChatroomInviteLink: async function() {
            if (!this.inviteLinkPending) {
                this.inviteLinkPending = true;
                let res = await fetch(`/invite/room/${this.chatroomInfo.id}`)
                let link = await res.json()
                this.inviteLink = link;
                console.log(this.inviteLink);
                this.inviteLinkPending = false;
            }
        },
        copyToClipboard: function() {
            const inviteLink = document.getElementById("island-invite-link");
            inviteLink.select();
            inviteLink.setSelectionRange(0, 99999)
            document.execCommand("copy");
        }
    }
})
    Vue.component("overlay-islander-card", {
        props: {
            member_id: Number,
            nickname: String,
            role: String,
            joined: String,
            islander_icon: String
        },
        template: `
        <div class="overlay-islander-card"
            v-if='role != "inactive"'>
            <div class='islander-info'
                v-if='!islanderActionPending'>
                <div class='islander-icon'
                    v-bind:style="{ backgroundImage: 'url(' + islander_icon + ')' }">
                </div>
                <div>
                    <span style="font-weight: bolder;">{{ nickname }}</span>
                    <span style="color: red;">{{ formattedRole }}</span>
                </div>
            </div>
            <div class='islander-option-confirm-prompt'
                        v-else>
                        {{ confirmPrompt }}
                        <i class="confirm fas fa-check"
                            v-on:click="confirmAction($root.chatroomInfo.id, member_id)"></i>
                        <i class="cancel fas fa-times"
                            v-on:click="cancelAction"></i>
                    </div>
            <div class='islander-options'
                v-if='member_id != $root.userInfo.id && $root.isAdmin'>
                <i class="fas fa-user-secret"
                    title='Promote Islander to Admin'
                    v-on:click='confirmMakeAdmin(nickname)'></i>
                <i class="fas fa-ban"
                    style='color: red;'
                    title='Remove Islander'
                    v-on:click='confirmDeleteIslander(nickname)'></i>
            </div>
        </div>
        `,
        data() {
            return {
                islanderActionPending: false,
                confirmPrompt: "",
                selectedAction: "",

                memberRole: this.role
            }
        },
        computed: {
            formattedRole: function() {
                if (this.memberRole) {
                    return ` (${this.memberRole})`
                } else {
                    return ""
                }
                
            }
        },
        methods: {
            confirmMakeAdmin: function(nickname) {
                this.confirmPrompt = `Promote ${nickname} to Admin?`;
                this.selectedAction = "makeAdmin";
                this.islanderActionPending = true;
            },
            confirmDeleteIslander: function(nickname) {
                this.confirmPrompt = `Remove ${nickname} from Island?`;
                this.selectedAction = "deleteIslander";
                this.islanderActionPending = true;
            },
            cancelAction: function() {
                this.islanderActionPending = false;
            },
            confirmAction: function(room, member) {
                switch(this.selectedAction) {
                    case "makeAdmin":
                        this.makeAdmin(room, member)
                        break;
                    case "deleteIslander":
                        this.removeIslander(room, member)
                        break;
                }
                this.islanderActionPending = false;
            },
            makeAdmin: async function(room, member) {
                await fetch(`/member/${room}/${member}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        'action': "makeAdmin"
                    })
                })
            },
            removeIslander: function(room, member) {
                deleteIslander(room, member)
            }
        }
    })

Vue.component('large-overlay-leave-island', {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <legend class="form-legend">Leave Island</legend> 
            <div class='overlay-image-container unselectable'>
                <img src='crying_icon.png' style="max-width: 200px; max-height: 200px;">
            </div>
            <h1>
                Are you sure you want to leave {{ chatroomInfo.name }}?
            </h1>
                Think of how much your friends will miss you :(
            
            <div class='overlay-form-element'>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                    I'm sorry, please take me back :'(
                </button>
                <button class="form-btn-cancel -nooutline" 
                    v-on:click='$root.deleteIslander(chatroomInfo.id, $root.userInfo.id)'>
                    im leabing this gronp >:(
                </button>
            </div>
        </div>
    </div>    
    `
})

Vue.component('large-overlay-none', {
    props: ['chatroomInfo'],
    template: `
    <div class='hidden'></div>
    `
})

