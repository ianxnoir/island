Vue.component('current-chatroom-top-navbar-personal', {
    props: ['chatroomInfo', 'memberData', 'userInfo'],
    template: `
    <nav class='chatroom-top-nav'>
        <div class='current-chatroom-icon'
            v-bind:style="{ backgroundImage: 'url(' + this.islanderInfo.islander_icon + ')' }">
            <div class='current-chatroom-icon-mask'>
            </div> 
        </div>
    
        <div class='current-chatroom-main-info'>
            <div class='current-chatroom-name'>    
                {{ islanderInfo.nickname }}
            </div>
            <div class='current-chatroom-members'>
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
                /*  id: 1,
                    name: "Island info",
                    overlay: "large-overlay-chatroom-info"
                },{
                    id: 2,
                    name: "View Islanders",
                    overlay: "large-overlay-manage-members"
                },{*/
                    id: 3,
                    name: "Create event",
                    overlay: "large-overlay-create-event"
                },{
                    id: 4,
                    name: "Create sticky message",
                    overlay: "large-overlay-create-sticky"
                },{
                    id: 5,
                    name: "View Island calendar",
                    overlay: "large-overlay-chatroom-calendar"
                },{
                    id: 6,
                    name: `Block`,
                    overlay: "large-overlay-block-islander"
                }
            ]
        }
    },
    computed: {
        islanderInfo: function() {
            for (let member of this.memberData) {
                if (member.member_id != this.userInfo.id) {
                    return member
                }
            }
        }
    },
    methods: {
        toggleChatroomMenu: function() {
            this.chatroomMenuVisible = !this.chatroomMenuVisible;
        }
    }

})



Vue.component('large-overlay-block-islander', {
    props: ['chatroomInfo', 'memberData', 'userInfo'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <legend class="form-legend">Block Islander</legend> 
            <div class='overlay-image-container unselectable'>
                <img src='crying_icon.png' style="max-width: 200px; max-height: 200px;">
            </div>
            <h1>
                Are you sure you want to block {{ islanderInfo.nickname }}?
            </h1>
                Think of how much they'll miss you :(
            
            <div class='overlay-form-element'>
            </div>

            <div class="form-actions unselectable">
                <button class="form-btn -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                    Never mind...
                </button>
                <button class="form-btn-cancel -nooutline" 
                    v-on:click='$root.deleteIslander(chatroomInfo.id, $root.userInfo.id)'>
                    Don't talk to me anymore
                </button>
            </div>
        </div>
    </div>    
    `,
    computed: {
        islanderInfo: function() {
            for (let member of this.memberData) {
                if (member.member_id != this.userInfo.id) {
                    return member
                }
            }
        }
    },
})

Vue.component('large-overlay-create-sticky', {
    props: ['chatroomInfo'],
    template: `
    <div>
        <div class='overlay-main-container'> 
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend">Create Sticky</legend>

            <div class="overlay-form-element">
                <span class='form-element-label'>Message:</span>
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

            <div class="form-actions unselectable">
                <button class="form-btn-cancel -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                    Cancel
                </button>
                <button class="form-btn"
                    v-on:click="submitSticky(chatroomInfo.id, stickyInfo)">
                    Save
                </button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            stickyInfo: {
                'content': this.chatroomInfo.sticky_content,
                'check_in': this.chatroomInfo.sticky_check_in
            }
        }
    },
    methods: {
        submitSticky: async function(room, stickyInfo) {
            await postSticky(room, stickyInfo);
            swapOverlayLarge('large-overlay-none');
        }
        
    }
})