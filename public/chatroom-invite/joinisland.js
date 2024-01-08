const joinRoom = async (room, token) => {
    const res = await fetch(`/checktoken/${room}/${token}`)
    const resJSON = await res.json();
    console.log(resJSON);
    if (resJSON.redirect) {
        window.location.href='island.html';
    }
}


const app = new Vue({
    el: ".vueApp",
    template: `
    <div>
        <div class='vue-container'>    
            <div class="card green">
                <div class="additional">
                    <div class="user-card">
                        <div class="level center">
                        Island
                        </div>
                        <div class='image-container'
                            v-bind:style="{ backgroundImage: 'url(' + this.chatroomInfo.chatroom_icon + ')' }">
                        </div>
                    </div>
                    <div class="more-info">
                        <h1>{{chatroomInfo.name}} <br> </h1>
                        <div class="coords">
                            <span>Privacy:</span>
                            <span>{{chatroomInfo.privacy}}</span>
                        </div>
                        <div class="coords">
                            <span>Description:</span>
                            <span>{{chatroomInfo.description}}</span>
                        </div>
                        <div class="coords">
                            <span>Created:</span>
                            <span>{{chatroomInfo.created_at.substring(0,10)}}</span>
                        </div>
                        <div class="stats">
                            <div>
                                <div class="title">Islanders</div>
                                <i class="fa fa-users"></i>
                                <div class="value">{{ chatroomInfo.chatroomMembers.length }}</div>
                            </div>
                            <div>
                                <div class="title">Coffee</div>
                                <i class="fa fa-coffee"></i>
                                <div class="value infinity">∞</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="general">
                    <h1>{{chatroomInfo.name}} </h1>
                    <p>{{chatroomInfo.description}}</p>
                </div>
            </div>
        </div>
    
        <hr>
        <div class='_2'>
            You have been invited to join:
        </div>
        <div class='_1'>
            {{ chatroomInfo.name }}
        </div>
        <div>
            <a class='btn' v-on:click="joinRoom(room, token)">JOIN</a>
            <a class='btn' href='homepage.html'>BACK TO ISLAND</a>
        </div>
    </div>
    `,
    data() {
        return {
            room: -1,
            token: "",
            chatroomInfo: {
                name: "",
                description: "",
                privacy: "",
                created_at: "",
                chatroom_icon: "",
                chatroomMembers: []
            }
        }
    },
    computed: {
        background: function() {
            return {
                "background-image": "url(" + this.chatroomInfo.chatroom_icon + ");"
            }
        }
    },
    methods: {
        joinRoom
    }
})


const getChatroomInfo = async (roomID) => {
    let res = await fetch(`/chatroom/id/${roomID}`, {
        method: "GET"
    });
    let info = await res.json();
    app.chatroomInfo = info;
}


function onload() {
    const currentURL = window.location.href
    const URLParams = new URLSearchParams(currentURL.substring(currentURL.indexOf('?')));
    if (URLParams.has('room') && URLParams.has('token')) {
        console.log()
        console.log(URLParams.get('token'))
        getChatroomInfo(URLParams.get('room'))
        app.room = URLParams.get('room')
        app.token = URLParams.get('token')
    }
}

document.onload = onload()
