

Vue.component('current-chatroom-top-navbar', {
    props: ['chatroomInfo', 'chatroomMemberList'],
    template: `
    <nav class='chatroom-top-nav'>
        <div class='current-chatroom-icon'
            v-bind:style="{ background: 'url(' + this.chatroomInfo.chatroom_icon + ')' }">
            <div class='current-chatroom-icon-mask'>
            </div> 
        </div>
    
        <div class='current-chatroom-main-info'>
            <div class='current-chatroom-name'>    
                {{ chatroomInfo.name }}
            </div>
            <div class='current-chatroom-members'>
                {{ chatroomMemberList }}
            </div>
        </div>
        <div class='chatroom-menu-toggle'
            v-on:click='toggleChatroomMenu'>
            <i class="fas fa-caret-down"></i>
        </div>
        <transition name="component-fade" mode="out-in">
            <div class='chatroom-menu'
                v-if='chatroomMenuVisible'
                v-on:click='toggleChatroomMenu'>
                <chatroom-menu-option
                    v-for='option of chatroomMenuOptions'
                    v-bind:key='option.id'
                    v-bind='option'>
                </chatroom-menu-option>
            </div>
        </transition>
    </nav>
    `,
    data() {
        return {
            chatroomMenuVisible: false,
            chatroomMenuOptions: [
                {
                    id: 1,
                    name: "Island info",
                    overlay: "large-overlay-chatroom-info"
                },{
                    id: 2,
                    name: "View Islanders",
                    overlay: "large-overlay-manage-members"
                },{
                    id: 3,
                    name: "Create event",
                    overlay: "large-overlay-create-event"
                /*},{
                    id: 4,
                    name: "Create sticky message",
                    overlay: "large-overlay-create-sticky"*/
                },{
                    id: 5,
                    name: "View Island calendar",
                    overlay: "large-overlay-chatroom-calendar"
                },{
                    id: 6,
                    name: "Leave Island",
                    overlay: "large-overlay-leave-island"
                }
            ]
        }
    },
    methods: {
        toggleChatroomMenu: function() {
            this.chatroomMenuVisible = !this.chatroomMenuVisible;
        }
    }

})

Vue.component('chatroom-menu-option', {
    props: {
        id: Number,
        name: String,
        overlay: String
    },
    template: `
    <div class='chatroom-menu-option'
        v-on:click='$root.swapOverlayLarge(overlay)'>
        {{ name }}
    </div>
    `
})

Vue.component('current-chatroom-sticky', {
    props: ['chatroomInfo', 'userInfo'],
    template: `
    <div class='current-chatroom-sticky'>   
        <transition name='sticky-toggle' mode="out-in">
            <component
                v-bind:is='$root.stickyDisplayMode'
                v-bind:chatroom-info='chatroomInfo'
                v-bind:user-info='userInfo'>
            </component>
        </transition>
    </div>
    `
})

Vue.component('sticky-message-hidden', {
    template: `
    <div class='sticky-message-toggle'
        v-on:click="$root.toggleStickyDisplayMode('sticky-message-expanded')">
    </div>
    `
})
Vue.component('sticky-message-expanded', {
    props: ['chatroomInfo', 'userInfo'],
    template: `
    <div class='sticky-message-expanded'>
        <div class='sticky-message-body'>
            <div class='sticky-message-body-content'>
                {{ chatroomInfo.sticky_content }}
            </div>
            <div class='sticky-message-checkin'
                v-if="chatroomInfo.sticky_check_in=='daily'"
                v-on:click='checkinToChatroomSticky'>
                <div
                    v-bind:class='indicatorChecked + " sticky-message-checkin-indicator"'>
                </div>
            </div>
        </div>
        <div class='short sticky-message-toggle'
            v-on:click="$root.toggleStickyDisplayMode('sticky-message-hidden')">
        </div>
    </div>
    `,
    mounted: function() {
        let res = ""
        if (this.chatroomInfo.sticky_daily_checkins instanceof Array) {
            for (let checkin of this.chatroomInfo.sticky_daily_checkins) {
                if (checkin.member_id == this.userInfo.id) {
                    res = "checked"
                } else {
                    continue;
                }
            }
        }
        this.indicatorChecked = res;
    },
    data() {
        return {
            indicatorChecked: ""
        }
    },
    methods: {
        checkinToChatroomSticky: async function() {
            if (!document.querySelector('.sticky-message-checkin-indicator').classList.contains('checked')) {
                document.querySelector('.sticky-message-checkin-indicator').classList.toggle('checked', true)
                await fetch(`/chatroom/sticky/checkin/${this.chatroomInfo.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        'linked-content-id': this.chatroomInfo.sticky_id
                    })
                })       
            }
        }
    }
})