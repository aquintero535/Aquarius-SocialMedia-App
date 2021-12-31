const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');


describe('check posts services', () => {
    let parentPostId = 'I9dIDlp3cjyRsK5R';
    let parentPostAuthorUsername = 'admin';

    describe('check home and user feed posts', () => {
        it('should return home feed posts', (done) =>{
            request(app)
            .get('/api/posts')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.a('array');
                checkPostProperties(res.body.data[0]);
                done();
            }).catch((err) => done(err));
        });

        it('should return posts from a user', (done) => {
            request(app)
            .get('/api/profile/admin/posts')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.a('array');
                checkPostProperties(res.body.data[0]);
                done();
            }).catch((err) => done(err));
        });
    });
    
    let tempPostLikesCount = null;
    let tempPostRepostCount = null;

    let tempNewPostId = null;
    describe('check posts', () => {
        it('should return a single post', (done) => {
            request(app)
            .get(`/api/posts/${parentPostId}`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                checkPostProperties(res.body.data);
                tempPostLikesCount = res.body.data.likes;
                tempPostRepostCount = res.body.data.reposts;
                done();
            }).catch((err) => done(err));
        });

        it('should submit a new post', (done) => {
            let newPostBody = 'Testing the app';
            request(app)
            .post('/api/posts')
            .auth(token, {type: "bearer"})
            .send({post_body: newPostBody})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('success').to.be.equal(true);
                expect(res.body).to.have.property('data');
                checkPostProperties(res.body.data);
                expect(res.body.data.body).to.equals(newPostBody);
                tempNewPostId = res.body.data.post_id;
                done();
            }).catch((err) => done(err));
        });

        it('should delete a post', (done) => {
            request(app)
            .delete(`/api/posts/${tempNewPostId}`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('success').to.equals(true);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('message').to.equals('Post deleted.');
                request(app)
                .get(`/api/posts/${tempNewPostId}`)
                .auth(token, {type: "bearer"})
                .expect(404, {error: {message: "This post doesn't exist."}}, done);
            }).catch((err) => done(err));
        }); 
    })
    
    let tempNewReplyId = null;
    describe('check replies', () => {
        it('should submit a new reply', (done) => {
            let newReplyBody = 'Testing the reply function';
            request(app)
            .post(`/api/posts/${parentPostId}/replies`)
            .auth(token, {type: "bearer"})
            .send({post_body: newReplyBody})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('success').to.be.equal(true);
                expect(res.body).to.have.property('data');
                checkPostProperties(res.body.data);
                expect(res.body.data).to.have.property('reply_to').to.equal(parentPostId)
                expect(res.body.data).to.have.property('replying_to').to.equal(parentPostAuthorUsername);
                expect(res.body.data.body).to.equals(newReplyBody);
                tempNewReplyId = res.body.data.post_id;
                done();
            }).catch((err) => done(err));
        });

        it('should get replies from a post', (done) => {
            request(app)
            .get(`/api/posts/${parentPostId}/replies`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data').to.be.an('array');
                checkPostProperties(res.body.data[0]);
                expect(res.body.data.find((reply) => reply.post_id === tempNewReplyId)).to.be.an('object');
                done();
            }).catch((err) => done(err));
        });

        it('should delete a reply from a post', (done) => {
            request(app)
            .delete(`/api/posts/${parentPostId}/replies`)
            .auth(token, {type: "bearer"})
            .send({post_id: tempNewReplyId})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('success').to.be.equal(true);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('message').to.be.equal('Your post has been deleted.');
                request(app)
                .get(`/api/posts/${tempNewReplyId}`)
                .auth(token, {type: "bearer"})
                .expect(404, {error: {message: "This post doesn't exist."}}, done);
            }).catch((err) => done(err));
        });
    });
    
    describe('check likes', () => {
        it('should like a post', (done) => {
            request(app)
            .post(`/api/posts/${parentPostId}/likes`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('liked').to.be.equal(true);
                request(app)
                .get(`/api/posts/${parentPostId}`)
                .auth(token, {type: "bearer"})
                .then((res) => {
                    expect(res.body.data.likes).to.equals(tempPostLikesCount+1);
                    done();
                });
            }).catch((err) => done(err));
        });

        it('should delete a like from a post', (done) => {
            request(app)
            .delete(`/api/posts/${parentPostId}/likes`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('liked').to.be.equal(false);
                request(app)
                .get(`/api/posts/${parentPostId}`)
                .auth(token, {type: "bearer"})
                .then((res) => {
                    expect(res.body.data.likes).to.equals(tempPostLikesCount);
                    done();
                });
            }).catch((err) => done(err));
        });
        
        it('should get liking accounts from a post', (done) => {
            request(app)
            .get('/api/posts/-3axFqZiei0lxxFH/likes')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.a('array');
                checkAccountProperties(res.body.data[0]);
                done();
            }).catch((err) => done(err));
        });
    });
    
    describe('check reposts', () => {
        it('should create a repost', (done) => {
            request(app)
            .post(`/api/posts/${parentPostId}/reposts`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('reposted').to.be.equal(true);
                request(app)
                .get(`/api/posts/${parentPostId}`)
                .auth(token, {type: "bearer"})
                .then((res) => {
                    expect(res.body.data.reposts).to.equals(tempPostRepostCount+1);
                    done();
                });
            }).catch((err) => done(err));
        });

        it('should delete a repost', (done) => {
            request(app)
            .delete(`/api/posts/${parentPostId}/reposts`)
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('reposted').to.be.equal(false);
                request(app)
                .get(`/api/posts/${parentPostId}`)
                .auth(token, {type: "bearer"})
                .then((res) => {
                    expect(res.body.data.reposts).to.equals(tempPostRepostCount);
                    done();
                });
            }).catch((err) => done(err));
        });
        
        it('should get reposting accounts from a post', (done) => {
            request(app)
            .get('/api/posts/0k54VB_0aK8TZhAX/reposts')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.a('array');
                checkAccountProperties(res.body.data[0]);
                done();
            }).catch((err) => done(err));
        });
    });

    const checkPostProperties = (post) => {
        expect(post).to.have.property('post_id').to.be.a('string');
        expect(post).to.have.property('body').to.be.a('string');
        expect(post).to.have.property('likes').to.be.a('number');
        expect(post).to.have.property('reposts').to.be.a('number');
        expect(post).to.have.property('replies').to.be.a('number');
        expect(post).to.have.property('profile_image').to.be.a('string');
        expect(post).to.have.property('profile_name').to.be.a('string');
        expect(post).to.have.property('username').to.be.a('string');
        expect(post).to.have.property('created_at').to.be.a('string');
        expect(post).to.have.property('already_reposted').to.be.a('number');
        expect(post).to.have.property('already_liked').to.be.a('number');
    };

    const checkAccountProperties = (account) => {
        expect(account).to.have.property('profile_id').to.be.a('number');
        expect(account).to.have.property('profile_image').to.be.a('string');
        expect(account).to.have.property('profile_name').to.be.a('string');
        expect(account).to.have.property('profile_bio').to.be.a('string');
        expect(account).to.have.property('username').to.be.a('string');
    }
})