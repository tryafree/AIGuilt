const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

describe('Security Tests', () => {
    let testUser;
    let testToken;

    beforeAll(async () => {
        // Create test user
        const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
        testUser = await User.create({
            email: 'test@security.com',
            password: hashedPassword,
            username: 'securitytester'
        });

        testToken = jwt.sign(
            { userId: testUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await User.deleteMany({});
    });

    describe('Authentication Security', () => {
        test('Should enforce password requirements', async () => {
            const weakPasswords = [
                'short',
                'nouppercaseornumber',
                'NOUPPERCASEORNUMBER',
                '12345678',
                'Password'
            ];

            for (const password of weakPasswords) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email: 'test@example.com',
                        password,
                        username: 'testuser'
                    });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('errors');
            }
        });

        test('Should prevent brute force attacks', async () => {
            const attempts = Array(6).fill({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

            for (let i = 0; i < attempts.length; i++) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send(attempts[i]);

                if (i < 5) {
                    expect(response.status).toBe(401);
                } else {
                    expect(response.status).toBe(429);
                }
            }
        });

        test('Should set secure cookies', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@security.com',
                    password: 'TestPassword123!'
                });

            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/HttpOnly/);
            expect(cookies[0]).toMatch(/Secure/);
            expect(cookies[0]).toMatch(/SameSite=Strict/);
        });
    });

    describe('API Security', () => {
        test('Should require authentication for protected routes', async () => {
            const response = await request(app)
                .get('/api/posts');

            expect(response.status).toBe(401);
        });

        test('Should validate input data', async () => {
            const invalidData = {
                title: '<script>alert("xss")</script>',
                content: { $gt: '' }  // NoSQL injection attempt
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Cookie', `token=${testToken}`)
                .send(invalidData);

            expect(response.status).toBe(400);
        });

        test('Should enforce rate limits', async () => {
            const requests = Array(101).fill(null);
            
            for (let i = 0; i < requests.length; i++) {
                const response = await request(app)
                    .get('/api/posts')
                    .set('Cookie', `token=${testToken}`);

                if (i < 100) {
                    expect(response.status).not.toBe(429);
                } else {
                    expect(response.status).toBe(429);
                }
            }
        });
    });

    describe('CORS Security', () => {
        test('Should reject unauthorized origins', async () => {
            const response = await request(app)
                .get('/api/posts')
                .set('Origin', 'http://malicious-site.com')
                .set('Cookie', `token=${testToken}`);

            expect(response.status).toBe(403);
        });

        test('Should allow authorized origins', async () => {
            const response = await request(app)
                .get('/api/posts')
                .set('Origin', 'http://localhost:3000')
                .set('Cookie', `token=${testToken}`);

            expect(response.status).not.toBe(403);
        });
    });

    describe('XSS Protection', () => {
        test('Should sanitize user input', async () => {
            const xssPayload = {
                title: '<script>alert("xss")</script>',
                content: '<img src="x" onerror="alert(1)">'
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Cookie', `token=${testToken}`)
                .send(xssPayload);

            expect(response.status).toBe(400);
        });

        test('Should set security headers', async () => {
            const response = await request(app)
                .get('/');

            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
        });
    });

    describe('JWT Security', () => {
        test('Should reject expired tokens', async () => {
            const expiredToken = jwt.sign(
                { userId: testUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );

            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', `token=${expiredToken}`);

            expect(response.status).toBe(401);
        });

        test('Should reject modified tokens', async () => {
            const modifiedToken = testToken.slice(0, -1) + '1';

            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', `token=${modifiedToken}`);

            expect(response.status).toBe(401);
        });
    });

    describe('Password Security', () => {
        test('Should properly hash passwords', async () => {
            const password = 'TestPassword123!';
            const user = await User.findOne({ email: 'test@security.com' });
            
            const isMatch = await bcrypt.compare(password, user.password);
            expect(isMatch).toBe(true);
            expect(user.password).not.toBe(password);
        });

        test('Should prevent password enumeration', async () => {
            const response1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'exists@example.com',
                    password: 'wrongpassword'
                });

            const response2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'doesnotexist@example.com',
                    password: 'wrongpassword'
                });

            expect(response1.body.message).toBe(response2.body.message);
        });
    });

    describe('Input Validation and Sanitization', () => {
        test('Should prevent SQL injection attempts', async () => {
            const sqlInjectionAttempts = [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT * FROM users; --",
                "admin'--",
                "' OR '1'='1' /*"
            ];

            for (const attempt of sqlInjectionAttempts) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'test@example.com',
                        password: attempt
                    });

                expect(response.status).toBe(401);
            }
        });

        test('Should prevent NoSQL injection attempts', async () => {
            const noSqlPayloads = [
                { email: { $ne: null }, password: { $ne: null } },
                { email: { $in: ['admin@example.com'] } },
                { email: { $regex: '.*' } },
                { $where: 'true' }
            ];

            for (const payload of noSqlPayloads) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send(payload);

                expect(response.status).toBe(400);
            }
        });

        test('Should prevent email header injection', async () => {
            const maliciousEmails = [
                'test@example.com\nBcc: malicious@attacker.com',
                'test@example.com\r\nContent-Type: text/html',
                'test@example.com\nSubject: Malicious Subject',
                'test@example.com\r\nFrom: admin@example.com'
            ];

            for (const email of maliciousEmails) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email,
                        password: 'ValidPass123!',
                        username: 'testuser'
                    });

                expect(response.status).toBe(400);
            }
        });
    });

    describe('Session Security', () => {
        test('Should invalidate session on password change', async () => {
            // Login and get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@security.com',
                    password: 'TestPassword123!'
                });

            const oldToken = loginResponse.headers['set-cookie'][0];

            // Change password
            await request(app)
                .post('/api/auth/change-password')
                .set('Cookie', oldToken)
                .send({
                    currentPassword: 'TestPassword123!',
                    newPassword: 'NewTestPass456!'
                });

            // Try to access protected route with old token
            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', oldToken);

            expect(response.status).toBe(401);
        });

        test('Should prevent concurrent sessions', async () => {
            const login1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@security.com',
                    password: 'TestPassword123!'
                });

            const login2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@security.com',
                    password: 'TestPassword123!'
                });

            expect(login1.headers['set-cookie'][0]).not.toBe(login2.headers['set-cookie'][0]);
        });
    });

    describe('File Upload Security', () => {
        test('Should reject malicious file types', async () => {
            const maliciousFiles = [
                { name: 'test.php', type: 'application/x-httpd-php' },
                { name: 'test.jsp', type: 'application/jsp' },
                { name: 'test.exe', type: 'application/x-msdownload' },
                { name: 'test.js', type: 'application/javascript' }
            ];

            for (const file of maliciousFiles) {
                const response = await request(app)
                    .post('/api/upload')
                    .set('Cookie', `token=${testToken}`)
                    .attach('file', Buffer.from('test'), file.name);

                expect(response.status).toBe(400);
            }
        });

        test('Should prevent directory traversal attempts', async () => {
            const traversalPaths = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\config',
                '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
                '....//....//....//etc/passwd'
            ];

            for (const path of traversalPaths) {
                const response = await request(app)
                    .get(`/api/files/${path}`)
                    .set('Cookie', `token=${testToken}`);

                expect(response.status).toBe(400);
            }
        });
    });

    describe('API Security Headers', () => {
        test('Should set Content Security Policy headers', async () => {
            const response = await request(app).get('/');
            
            expect(response.headers['content-security-policy']).toBeDefined();
            expect(response.headers['content-security-policy']).toContain("default-src 'self'");
            expect(response.headers['content-security-policy']).toContain("script-src 'self'");
        });

        test('Should set HSTS header', async () => {
            const response = await request(app).get('/');
            
            expect(response.headers['strict-transport-security']).toBeDefined();
            expect(response.headers['strict-transport-security']).toContain('max-age=');
            expect(response.headers['strict-transport-security']).toContain('includeSubDomains');
        });
    });

    describe('Error Handling Security', () => {
        test('Should not expose stack traces in production', async () => {
            process.env.NODE_ENV = 'production';
            
            const response = await request(app)
                .get('/api/nonexistent')
                .set('Cookie', `token=${testToken}`);

            expect(response.body.stack).toBeUndefined();
            expect(response.body.message).not.toContain('at');
            
            process.env.NODE_ENV = 'test';
        });

        test('Should sanitize error messages', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: { $ne: null }
                });

            expect(response.body.message).not.toContain('$ne');
            expect(response.body.message).not.toContain('MongoDB');
        });
    });

    describe('Token Security', () => {
        test('Should prevent token reuse after logout', async () => {
            // Login
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@security.com',
                    password: 'TestPassword123!'
                });

            const token = loginResponse.headers['set-cookie'][0];

            // Logout
            await request(app)
                .post('/api/auth/logout')
                .set('Cookie', token);

            // Try to use token after logout
            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', token);

            expect(response.status).toBe(401);
        });

        test('Should rotate refresh tokens', async () => {
            const tokens = new Set();
            
            for (let i = 0; i < 3; i++) {
                const response = await request(app)
                    .post('/api/auth/refresh')
                    .set('Cookie', `token=${testToken}`);

                const newToken = response.headers['set-cookie'][0];
                expect(tokens.has(newToken)).toBe(false);
                tokens.add(newToken);
            }
        });
    });

    describe('Rate Limiting', () => {
        test('Should apply IP-based rate limiting', async () => {
            const requests = Array(11).fill(null);
            
            for (let i = 0; i < requests.length; i++) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .set('X-Forwarded-For', '192.168.1.1')
                    .send({
                        email: 'test@security.com',
                        password: 'TestPassword123!'
                    });

                if (i < 10) {
                    expect(response.status).not.toBe(429);
                } else {
                    expect(response.status).toBe(429);
                }
            }
        });

        test('Should prevent API abuse', async () => {
            const endpoints = [
                '/api/posts',
                '/api/users',
                '/api/comments',
                '/api/search'
            ];

            for (const endpoint of endpoints) {
                const requests = Array(101).fill(null);
                
                for (let i = 0; i < requests.length; i++) {
                    const response = await request(app)
                        .get(endpoint)
                        .set('Cookie', `token=${testToken}`);

                    if (i < 100) {
                        expect(response.status).not.toBe(429);
                    } else {
                        expect(response.status).toBe(429);
                    }
                }
            }
        });
    });
});
