const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!',
                    username: 'testuser',
                    displayName: 'Test User'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should not register user with existing email', async () => {
            await User.create({
                email: 'test@example.com',
                password: 'Password123!',
                username: 'existinguser',
                displayName: 'Existing User'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!',
                    username: 'testuser',
                    displayName: 'Test User'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                email: 'test@example.com',
                password: 'Password123!',
                username: 'testuser',
                displayName: 'Test User'
            });
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
});