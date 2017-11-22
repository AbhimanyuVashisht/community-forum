
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

app.use('/', (req, res)=>{
   res.sendFile(path.join(__dirname + '/views', 'index.html'));
});

let numUsers = 0; // To store the count of the number of users connected
let numRooms = 0; // To store the count of active rooms
let chatRoom = []; // Array to store the messages TODO: add the support of the database,
// TODO: chatBot to fetch the session periodically from the db and store it as a log

let users = {}; // To store the logged in user as a key-value pair
let userList = []; // To store the list of online users

let rooms = {}; // To store the rooms in the namespace mapping socket.id to room
let roomsMap = {}; // Rooms map to a index to fetch the userList
io.on('connection', (socket)=>{
    let addedUser = false;

    // When the client emits 'new message', this listens and executes
    socket.on('new message', (data)=>{

        console.log(rooms[socket.id] + 'connection');
        console.log(rooms);
        chatRoom.push({
            username: socket.username,
            message: data
        });

        fs.appendFile('chatlog/'+ rooms[socket.id].split('/')[1], '\n[' + date + '] '+socket.username + ': ' + data, (err)=>{
           if(err) throw err;
        });

        console.log(rooms[socket.id]);
        socket.to(rooms[socket.id]).emit('new message', {
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
    socket.on('add user', (data)=>{
        if (addedUser) return;

        console.log(socket.id + '                    '  + data.username);
        // Joining the room specified in the namespace
        socket.join(data.room);

        rooms[socket.id] = data.room; // key-value pair linking socket.id to rooms

        //To store the Online users for each room
        if(roomsMap[data.room] !== undefined){
            // console.log(roomsMap[data.room]);
          userList[roomsMap[data.room]].push(data.username);
        }else {
            roomsMap[data.room] = numRooms++;
            userList.push([data.username]);
        }

        console.log(userList);


        users[data.username] = socket.id;


        // we store the username in the socket session for this client
        socket.username = data.username;
        ++numUsers;
        addedUser = true;

        console.log(rooms[socket.id]);

        socket.emit('login', {
            numUsers: userList[roomsMap[data.room]].length,
            userList: userList[roomsMap[data.room]]
        });

        chatRoom.push({
            username: socket.username,
            message: 'joined'
        });


        fs.appendFile('chatlog/'+ rooms[socket.id].split('/')[1], '\n[' + date + '] '+ socket.username + ' joined', (err)=>{
            if(err) throw err;
        });

        // echo globally (all clients) that a person has connected
        socket.to(rooms[socket.id]).emit('user joined', {
            username: socket.username,
            numUsers: userList[roomsMap[data.room]].length,
            userList: userList[roomsMap[data.room]]
        });
    });

    // When the client emit 'typing', we broadcast it to other
    socket.on('typing', ()=>{
        socket.to(rooms[socket.id]).emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', ()=>{
        socket.to(rooms[socket.id]).emit('stop typing', {
          username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // remove the username of the logged of user from the userList
            userList[roomsMap[rooms[socket.id]]].splice(userList.indexOf(socket.username), 1);

            chatRoom.push({
                username: socket.username,
                message: 'left'
            });


            fs.appendFile('chatlog/' + rooms[socket.id].split('/')[1], '\n[' + date + '] '+ socket.username + ' left', (err)=>{
                if(err) throw err;
            });

            // echo globally that this client has left
            socket.to(rooms[socket.id]).emit('user left', {
                username: socket.username,
                numUsers: numUsers,
                userList: userList
            });
        }
    });
});

http.listen(port, function(){
    console.log("ServerRunning on http://localhost:3000/");        
});