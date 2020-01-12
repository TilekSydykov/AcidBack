const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const chats = {};
const users = {};

function addUser (id, data){
    if(users[id]){
        return;
    }
    users[id] = data;
}
function generateNewChat(user1, user2){
    let u = checkChatExist(user1, user2);
    if (u) return u;
    return {
        user1: user1,
        user2: user2,
        message: []
    };
}

function getUserById(id){
    return users[id];
}

function checkChatExist(user1, user2){
    Object.keys(chats).forEach(i =>{
        let b = chats[i];
        if(b.user1.id === user1.id || b.user1.id === user2.id){
            if(b.user2.id === user1.id || b.user2.id === user2.id){
                return b;
            }
        }
    });
    return undefined;
}

function sendMessage(data){
    let chat = checkChatExist(data.target, data.sender);
    let user = getUserById(data.target);
    user.socket.emit('newmessage', {
        sender: data.sender,
        text: data.text
    });
    chat.message.push(data);
}

function notifyAll(){
    Object.keys(users).forEach(it => {
        users[it].socket.emit('newuser', {users: users})
    })
}

io.on("connection", socket => {
    console.log(socket.id);
    socket.on('new', data => {
        console.log('new ' + data);
        addUser(socket.id, {
            socket: socket,
            name: data.name
        });
        notifyAll();
        socket.emit('online', {users: users});
    });

    socket.on('message', data => {
        data.sender = socket.id;
        sendMessage(data);
    });

    socket.on('newchat', data => {
        let result;
        let user2 = getUserById(data.target.id);
        if (user2){
            result = checkChatExist(getUserById(socket.id), user2);
            if (result) {
                io.emit('newchat', result);
                return;
            }
            result = generateNewChat(getUserById(socket.id), user2);
            socket.emit('newchat', result);
        }
    });

    socket.on('getchat', data => {
        if (chats[data.id]){
            socket.emit('chatmessages', chats[data.id]);
        }else{
            socket.emit('chatmessages', {});
        }
    });
});

http.listen(9000);