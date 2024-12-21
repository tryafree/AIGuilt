const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Join rooms for posts user is following
        socket.on('joinPost', (postId) => {
            socket.join(`post:${postId}`);
        });

        socket.on('leavePost', (postId) => {
            socket.leave(`post:${postId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};