//  Methods used by components on this file:
const daysInMonth = (month) => { 
    return new Date(1, (month + 1), 0).getDate(); 
} 

Vue.component('large-overlay-chatroom-calendar', {
    props: ['chatroomInfo', 'chatroomEvents'],
    template: `
    <div>
        <div class='overlay-main-container'>
            <div class='overlay-quick-access-options'
                v-on:click="$root.returnToPreviousOverlayLarge">
                <i class="fas fa-undo-alt"></i> Back
            </div>
            <legend class="form-legend"
                v-if='chatroomInfo.privacy != "personal"'>Calendar for {{ chatroomInfo.name }}</legend>
            <legend class="form-legend"
                v-else>Calendar</legend>
            <div class='calendar-nav'>
                <div class='date-control-previous'
                    v-on:click="month--">
                    <i class="fas fa-angle-left"></i>   
                </div>
                <h3> {{ months[displayMonth] }} </h3>
                <div class='date-control-next'
                    v-on:click="month++">
                    <i class="fas fa-angle-right"></i>
                </div>
            </div>
            <div class='calendar-nav'>
                <div class='date-control-previous'
                    v-on:click="year--">
                    <i class="fas fa-angle-left"></i>   
                </div>
                <h3> {{ year }} </h3>
                <div class='date-control-next'
                    v-on:click="year++">
                    <i class="fas fa-angle-right"></i>
                </div>
            </div>
            <chatroom-calendar-container
                v-bind:days = 'displayArray'>
            </chatroom-calendar-container>
            <div class="form-actions unselectable">
                <button class="form-btn -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                    Back to group
                </button>
                <button class="form-btn -nooutline" type="reset"
                    v-on:click="$root.swapOverlayLarge('large-overlay-create-event')">
                    Create event
                </button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            months: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ],
            weekdays: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            date: new Date().getDate(),
            month: new Date().getMonth(),
            year: new Date().getFullYear(),

            eventData: this.chatroomEvents
        }
    },
    computed: {
        eventMap: function() {
            let eventMap = new Map();
            let events = [];
            console.log(this.eventData)
            for (let event of this.eventData) {    
                events.push({
                    id: event.id,
                    date: event.date.split("/").map((num) => parseInt(num)),
                    description: event.description,
                    name: event.name,
                    time: event.time
                })
            }
            for (let e of events) {
                if (!eventMap.get(e.date[2])) {
                    eventMap.set(e.date[2], new Map())   
                }
                if (!eventMap.get(e.date[2]).get(e.date[0])) {
                    eventMap.get(e.date[2]).set(e.date[0], [])
                }
                eventMap.get(e.date[2]).get(e.date[0]).push(e)
            }
            return eventMap
        },
        displayArray: function() {
            let days = []
            let monthEvents = [];
            if (this.eventMap.get(this.year)) {
                if (this.eventMap.get(this.year).get(this.displayMonth + 1)) {
                    monthEvents = this.eventMap.get(this.year).get(this.displayMonth + 1)
                }
            }
            for (let i = 0; i < daysInMonth(this.displayMonth); i++) {
                days.push({
                    id: i,
                    date: i + 1,
                    weekday: this.weekdays[new Date(this.year, this.displayMonth, (i + 1)).getDay()].substring(0, 3),
                    events: []
                })
            }
            for (let e of monthEvents) {
                days[e.date[1] - 1].events.push(e);
            }
            return days;
        },
        displayMonth: function() {
            let res = this.month;
            while (res < 0) {
                res += 12
            }
            return res % 12;
        }
    },
    methods: {
        daysInMonth
    }
})
    Vue.component('chatroom-calendar-container', {
        props: ['days'],
        template: `
        <div class="chatroom-overlay-calendar">
            <calendar-day 
                v-for="day in days"
                v-bind:key="day.id"
                v-bind:day='day'>
            </calendar-day>
        </div>
        `
    })

    Vue.component('calendar-day', {
        props: ['day'],
        template: `
        <div class='calendar-day'>
            <div v-bind:class='dateBoxStyle'>
                <h4>{{ day.date }}</h4>
                {{ day.weekday }}
            </div>
            <div class='event-box'>
                <div class='calendar-event-wrapper'
                    v-for='event in day.events'
                    v-bind="event">
                    <h4> {{ event.name }} </h4>
                    {{ event.time.substring(0,5) }} </br>
                    {{ event.description }}
                    <div class='share-event-prompt'
                        v-on:click="$root.shareEvent(event.id)">
                        Share event...
                    </div>
                </div>
            </div>
        </div>
        `,
        computed: {
            dateBoxStyle: function() {
                if (this.day.weekday == "Sunday") {
                    return "date-box-sunday"
                } else {
                    return "date-box"
                }
            }
        }
    })
    
    Vue.component('large-overlay-share-event', {
        props: ['chatroomInfo', 'chatroomEvents', 'userRooms', 'sharingEvent', 'memberData'],
        template: `
        <div>
            <div class='overlay-main-container'>
                <div class='overlay-quick-access-options'
                    v-on:click="$root.returnToPreviousOverlayLarge">
                    <i class="fas fa-undo-alt"></i> Back
                </div>
                <legend class="form-legend">Share Event</legend>
                
                <div class='overlay-form-element'>
                    <input class='form-element-field'
                        placeholder='Add a message...'
                        v-model='shareEventMessage'>
                </div>
                
                <div class="overlay-form-element overlay-form-element-split-content">
                    <div class="overlay-form-subelement">
                        <div class='selected calendar-event-wrapper'
                            v-html="sharedEventPreview">
                        </div>
                        </br>
                        <div class="form-element-bar"></div>
                        <div class='calendar-event-wrapper'
                            v-for='event in chatroomEvents'
                            v-bind="event"
                            v-bind:key="event.id"
                            v-bind:class="isSharedEvent(event.id)"
                            v-on:click="makeSharedEvent(event.id)">
                            <h4> {{ event.name }} </h4>
                            {{ event.time }} </br>
                            <div class='event-description-text'>
                                {{ event.description }}
                            </div>
                        </div>
                    </div>
                    <div class="overlay-form-subelement">
                        <div class="calendar-event-wrapper"
                            v-for="room in userRooms"
                            v-bind:key="room.chatroom_id"
                            v-bind="room"
                            v-on:click="addToSendingList($event, room.chatroom_id)">
                            <span>{{ modifiedRoomName(room, $root.userInfo.id) }}</span> 
                            <span></span> 
                        </div>      
                    </div>
                </div>
                <div class="form-actions unselectable">
                    <button class="form-btn-cancel -nooutline" type="reset"
                        v-on:click="$root.swapOverlayLarge('large-overlay-none')">
                        Cancel
                    </button>
                    <button class="form-btn"
                        v-on:click="$root.sendShareEventMessages(sendingList, sharedEventIndex, shareEventMessage)">
                        Share event
                    </button>
                </div>
            </div>
        </div>
        `,
        data() {
            return {
                sendingList: [],
                shareEventMessage: "",
                sharedEventIndex: this.sharingEvent
            }
        },
        computed: {
            sharedEvent: function() {
                for (let event of this.chatroomEvents) {
                    if (event.id == parseInt(this.sharedEventIndex)) {
                        return event;
                    }
                }
            },
            sharedEventPreview: function() {
                if (this.sharedEventIndex == null) {
                    return `
                        <h3>Pick an event to share with your friends!</h3>
                        `
                } else {
                    return `
                    <h4> ${ this.sharedEvent.name } </h4>
                    ${ this.sharedEvent.time } </br>
                    <div class='event-description-text'>
                        ${ this.truncated(this.sharedEvent.description) }
                    </div>
                    `
                }     
            }
        },
        methods: {
            addToSendingList: function (evt, id) {
                if (this.sendingList.indexOf(id) < 0) {
                    this.sendingList.push(id)
                    evt.target.classList.add('selected')
                } else {
                    this.sendingList.splice(this.sendingList.indexOf(id), 1)
                    evt.target.classList.remove('selected')
                }
            },
            isSharedEvent: function(id) {
                if (id == this.sharedEventIndex) {
                    return "selected"
                } else {
                    return ""
                }
            },
            makeSharedEvent: function(id) {
                this.sharedEventIndex = id;
            },
            truncated: function(text) {
                if (text.length > 32) {
                    return text.substring(0, 29) + "..."
                } else {
                    return text;
                }
            },
            modifiedRoomName: function (room, user) {
                if (room.privacy != 'personal') {
                    return room.name
                } else {
                    for (let member of room.memberData) {
                        if (member.member_id != user) {
                            return member.nickname
                        }
                    }
                }
            }
        }   
    })

    