
const express = require('express');
const path = require('path');
const app = express();
let port = process.env.PORT || 3000;
// let datetime =  require('node-datetime');

let http = require('http').createServer(app)
    , io = require('socket.io')(http);

// let chat = io.of('/chat');

const fs =require('fs');
let date = new Date();

app.set('view-engine', 'ejs');
//Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname + '/views', 'index.html'));
});

let numUsers = 0; // To store the count of the number of users connected
let chatRoom = []; // Array to store the messages TODO: add the support of the database,
// TODO: chatBot to fetch the session periodically from the db and store it as a log

let users = {}; // To store the logged in user as a key-value pair
io.on('connection', (socket)=>{
    let addedUser = false;

    // When the client emits 'new message', this listens and executes
    socket.on('new message', (data)=>{

        chatRoom.push({
            username: socket.username,
            message: data
        });

        fs.appendFile('chatlog/communityLog.txt', '\n[' + date + '] '+socket.username + ': ' + data, (err)=>{
           if(err) throw err;
        });
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // When the client emits 'private message', this listens and executes
    socket.on('private message', (data)=>{
        if(users[data.receiver]){
            let receiverID = users[data.receiver];

            // To emit the 'private message' event to the prescribed socketID
            io.sockets.connected[receiverID].emit('private message', {
                username: socket.username,
                message: data.message
            });
        }
    });

    // When the client emits 'add user', this listens and executes
    socket.on('add user', (username)=>{
        if (addedUser) return;

        // console.log(socket.id);
        users[username] = socket.id;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        chatRoom.push({
            username: socket.username,
            message: 'joined'
        });
        fs.appendFile('chatlog/communityLog.txt', '\n[' + date + '] '+ socket.username + ' joined', (err)=>{
            if(err) throw err;
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // When the client emit 'typing', we broadcast it to other
    socket.on('typing', ()=>{
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', ()=>{
        socket.broadcast.emit('stop typing', {
          username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            chatRoom.push({
                username: socket.username,
                message: 'left'
            });


            fs.appendFile('chatlog/communityLog.txt', '\n[' + date + '] '+ socket.username + ' left', (err)=>{
                if(err) throw err;
            });
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

http.listen(port, function(){
    console.log("ServerRunning on http://localhost:3000/");        
});