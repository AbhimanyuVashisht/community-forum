
const express = require('express');
const path = require('path');
const app = express();

let http = require('http').Server(app)
    , io = require('socket.io')(http);



app.get('/', (req, res)=>{
   res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', (socket)=>{
    // console.log(socket);
    console.log('a user connected');
    // Each user firea a special disconnect event
    socket.on('disconnect', ()=>{
        console.log('user disconnected');
    });
    // Custom event
    socket.on('chat message', (msg)=>{
        // console.log('message ' + msg );
        io.emit('chat message', msg);
    })
});

http.listen(3000, function(){
    console.log("ServerRunning on http://localhost:3000/");        
});