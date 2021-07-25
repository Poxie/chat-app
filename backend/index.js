const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({origin: '*'}))
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

const rooms = {};
io.on('connection', socket => {
    let isInRoom = false;
    socket.on('join-room', ({ roomId, user, isMuted, hasCamera }) => {
        socket.join(roomId);
        isInRoom = true;
        socket.broadcast.to(roomId).emit('user-connected', {user, isMuted, hasCamera});
        if(!rooms[roomId]) rooms[roomId] = {members: 0};
        if(rooms[roomId]) rooms[roomId].members++;

        socket.on('disconnect', () => {
            console.log(socket.rooms);
            if(rooms[roomId] && isInRoom) rooms[roomId].members--;
            socket.broadcast.to(roomId).emit('user-disconnected', user);
        })
    })
    socket.on('leave-room', ({ roomId, user }) => {
        if(rooms[roomId]) rooms[roomId].members--;
        socket.broadcast.to(roomId).emit('user-disconnected', user);
        socket.leave(roomId);
        isInRoom = false;
    })
    socket.on('toggle-mute', ({ roomId, isMuted, streamId, userId }) => {
        console.log('received toggle mute')
        socket.broadcast.to(roomId).emit('toggle-mute', ({ streamId, isMuted, userId }));
    })
    socket.on('toggle-camera', ({ roomId, hasCamera, streamId, userId }) => {
        console.log('received toggle camera')
        socket.broadcast.to(roomId).emit('toggle-camera', ({ streamId, hasCamera, userId }));
    })
    socket.on('send-message', ({ roomId, content, author }) => {
        console.log('received message');
        io.in(roomId).emit('send-message', ({ content, author, date: Date.now() }));
    })
    socket.on('listen-to-room', roomId => {
        const interval = setInterval(() => {
            socket.emit('member-update', rooms[roomId]?.members || 0);
        }, 1000);
        socket.on('stop-listening', () => {
            clearInterval(interval);
        })
    })
})

server.listen(3001);