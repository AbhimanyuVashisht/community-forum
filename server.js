
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

    // When the client emits 'new message', this listens and executes
    socket.on('new message', (data)=>{
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

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

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

});

http.listen(3000, function(){
    console.log("ServerRunning on http://localhost:3000/");        
});