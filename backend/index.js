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

io.on('connection', socket => {
    socket.on('join-room', ({ roomId, user }) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', user);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', user);
        })
    })
    socket.on('toggle-mute', ({ roomId, isMuted, streamId }) => {
        console.log('received toggle mute')
        socket.broadcast.to(roomId).emit('toggle-mute', ({ streamId, isMuted }));
    })
    socket.on('toggle-camera', ({ roomId, hasCamera, streamId }) => {
        console.log('received toggle camera')
        socket.broadcast.to(roomId).emit('toggle-camera', ({ streamId, hasCamera }));
    })
    socket.on('send-message', ({ roomId, content, author }) => {
        console.log('received message');
        io.in(roomId).emit('send-message', ({ content, author, date: Date.now() }));
    })
})

server.listen(3001);