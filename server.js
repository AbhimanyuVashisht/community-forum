
const express = require('express');
const path = require('path');
const app = express();

let http = require('http').createServer(app)
    , io = require('socket.io')(http);

app.set('view-engine', 'ejs');
//Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname + '/views', 'index.html'));
});

let numUsers = 0;

io.on('connection', (socket)=>{
    let addedUser = false;

    // When the client emits 'add user', this listens and executes
    socket.on('add user', (username)=>{
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        })


    })
});

http.listen(3000, function(){
    console.log("ServerRunning on http://localhost:3000/");        
});