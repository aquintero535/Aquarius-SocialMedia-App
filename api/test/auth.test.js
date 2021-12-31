const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('check sign in process', () => {
    it('should accept valid credentials', (done) => {
        request(app)
        .post('/auth/signin')
        .send({username: 'admin', password: 'admin'})
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('auth_token');
            expect(res.body.data).to.have.property('user');
            expect(res.body.data.user).to.have.property('user_id');
            expect(res.body.data.user).to.have.property('profile_name');
            expect(res.body.data.user).to.have.property('profile_image');
            expect(res.body.data.user).to.have.property('username');
            expect(res.body.data.user).to.have.property('followers');
            expect(res.body.data.user).to.have.property('following');
            token = res.body.data.auth_token;
            done();
        }).catch((err) => done(err));
    });

    it("shouldn't accept invalid credentials", (done) => {
        request(app)
        .post('/auth/signin')
        .send({username: 'admin', password: '12345678'})
        .expect(401, done);
    });
});

describe('check sign up process', () => {
    it('should accept valid fields', (done) => {
        request(app)
        .post('/auth/signup')
        .send({
            name: 'John Smith',
            username: 'johnsmith',
            email: 'johnsmith@aquarius.com',
            password: '12345678',
            gender: 'M',
            day: 13,
            month: 4,
            year: 1995,
            termsChecked: true
        })
        .expect(204, done)
    });

    it("shouldn't accept invalid fields", (done) => {
        request(app)
        .post('/auth/signup')
        .send({
            name: '123',
            username: 'johns',
            password: true,
            gender: 0,
            day: false,
            month: false,
            year: true,
            termsChecked: ""
        })
        .expect(400, done)
    });
});

describe("check protected endpoints", () => {
    it("shouldn't access protected endpoints without a token", (done) => {
        request(app)
        .get('/api/posts')
        .expect(401, {error: {message: 'You have to be signed in to perform this action.'}}, done);
    })

    it("shouldn't access protected endpoints without a valid token", (done) => {
        request(app)
        .get('/api/profile/admin')
        .auth('random-token', {type: "bearer"})
        .expect(401, {error: {message: 'You have to be signed in to perform this action.'}}, done);
    })

    it("should access protected endpoints with a valid token", (done) => {
        request(app)
        .get('/api/profile/admin')
        .auth(token, {type: "bearer"})
        .expect(200, done);
    });
});
