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
    })
})

server.listen(3001);