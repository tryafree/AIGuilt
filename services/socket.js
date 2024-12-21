const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user._id}`);
        
        // Join user's personal room for private updates
        socket.join(`user:${socket.user._id}`);
        
        // Update user's online status
        User.findByIdAndUpdate(socket.user._id, { lastActive: new Date() }).exec();

        // Handle profile updates
        socket.on('profileUpdate', async (data) => {
            try {
                const user = await User.findByIdAndUpdate(
                    socket.user._id,
                    { $set: data },
                    { new: true }
                ).select('-password');
                
                io.to(`user:${socket.user._id}`).emit('profileUpdated', user);
            } catch (error) {
                console.error('Profile update error:', error);
                socket.emit('error', { message: 'Failed to update profile' });
            }
        });

        // Handle follow/unfollow
        socket.on('follow', async (targetUserId) => {
            try {
                const [user, targetUser] = await Promise.all([
                    User.findByIdAndUpdate(
                        socket.user._id,
                        { $addToSet: { following: targetUserId } },
                        { new: true }
                    ),
                    User.findByIdAndUpdate(
                        targetUserId,
                        { $addToSet: { followers: socket.user._id } },
                        { new: true }
                    )
                ]);

                io.to(`user:${socket.user._id}`).emit('followingUpdated', user.following);
                io.to(`user:${targetUserId}`).emit('followersUpdated', targetUser.followers);
            } catch (error) {
                console.error('Follow error:', error);
                socket.emit('error', { message: 'Failed to follow user' });
            }
        });

        socket.on('unfollow', async (targetUserId) => {
            try {
                const [user, targetUser] = await Promise.all([
                    User.findByIdAndUpdate(
                        socket.user._id,
                        { $pull: { following: targetUserId } },
                        { new: true }
                    ),
                    User.findByIdAndUpdate(
                        targetUserId,
                        { $pull: { followers: socket.user._id } },
                        { new: true }
                    )
                ]);

                io.to(`user:${socket.user._id}`).emit('followingUpdated', user.following);
                io.to(`user:${targetUserId}`).emit('followersUpdated', targetUser.followers);
            } catch (error) {
                console.error('Unfollow error:', error);
                socket.emit('error', { message: 'Failed to unfollow user' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user._id}`);
            User.findByIdAndUpdate(socket.user._id, { lastActive: new Date() }).exec();
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
    init,
    getIO
};
