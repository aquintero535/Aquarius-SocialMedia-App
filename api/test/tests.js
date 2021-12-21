const request = require('supertest');
const app = require('../app');

describe('check API status', function() {
    it('should return OK status', function(done) {
        request(app)
        .get('/')
        .expect(200, done)
    });
});

require('./auth.test');
require('./user.test');
require('./posts.test');