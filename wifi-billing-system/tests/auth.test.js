const request = require('supertest');
const app = require('../server');

describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
        it('should return 400 for missing credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 for invalid credentials format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'ab', // too short
                    password: '123' // too short
                });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/health');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'healthy');
            expect(res.body).toHaveProperty('timestamp');
        });
    });
});
