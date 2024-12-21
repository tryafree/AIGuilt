const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

let mongoServer;

// Setup function
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Cleanup function
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

// Helper function to generate test tokens
global.generateTestToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

// Mock socket.io
jest.mock('socket.io', () => {
    return function() {
        return {
            use: jest.fn(),
            on: jest.fn(),
            emit: jest.fn()
        };
    };
});