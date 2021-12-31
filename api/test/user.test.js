const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('check user services', () => {
    let tempFollowersCount = null;
    let profileId = null;
    describe('check profile queries', () => {
        it('should get an user profile', (done) => {
            request(app)
            .get('/api/profile/user2')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                checkProfileProperties(res.body.data);
                tempFollowersCount = res.body.data.followers;
                profileId = res.body.data.profile_id;
                done();
            }).catch((err) => done(err));
        });

        it("should return 404 if can't find an user profile", (done) => {
            request(app)
            .get('/api/profile/gghgihgi')
            .auth(token, {type: "bearer"})
            .expect(404)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.have.property('message')
                    .to.be.equal("This user profile doesn't exist.");
                done();
            }).catch((err) => done(err));
        });

        it('should update an user profile', (done) => {
            request(app)
            .put('/api/profile/admin')
            .auth(token, {type: "bearer"})
            .field('user_id', 1)
            .field('profile_name', 'AdminTest')
            .field('profile_bio', 'Changing my profile bio')
            .attach('profile_header', 'public/files/default-header.jpg')
            .attach('profile_image', 'public/files/default-profile-image.jpg')
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('success').to.equals(true);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('profile_header')
                    .to.equals('/files/profile_headers/1.jpg');
                expect(res.body.data).to.have.property('profile_image')
                    .to.equals('/files/profile_images/1.jpg');
                done();
            }).catch((err) => done(err));
        });

        it("shouldn't update an user profile of another", (done) => {
            let tempNewName = 'AdminTest';
            let tempNewBio = 'Changing my profile bio';
            request(app)
            .put('/api/profile/user2')
            .auth(token, {type: "bearer"})
            .field('profile_name', tempNewName)
            .field('profile_bio', tempNewBio)
            .attach('profile_header', 'public/files/default-header.jpg')
            .attach('profile_image', 'public/files/default-profile-image.jpg')
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                request(app)
                .get('/api/profile/user2')
                .auth(token, {type: "bearer"})
                .expect(200)
                .then((res) => {
                    expect(res.body.data.profile_name).is.not.equal(tempNewName);
                    expect(res.body.data.profile_bio).is.not.equal(tempNewBio);
                    done();
                })
            })
        });
    });

    describe('check account follow service', () => {
        it('should get followers from an account', (done) => {
            request(app)
            .get('/api/profile/user2/followers')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data').to.be.an('array');
                expect(res.body.data[0]).to.have.property('profile_id').to.be.a('number');
                expect(res.body.data[0]).to.have.property('profile_image').to.be.a('string');
                expect(res.body.data[0]).to.have.property('profile_name').to.be.a('string');
                expect(res.body.data[0]).to.have.property('profile_bio').to.be.a('string');
                expect(res.body.data[0]).to.have.property('username').to.be.a('string');
                done();
            }).catch((err) => done(err));
        });

        it('should get the accounts that an account follows', (done) => {
            request(app)
            .get('/api/profile/user2/following')
            .auth(token, {type: "bearer"})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data').to.be.an('array');
                expect(res.body.data[0]).to.have.property('profile_id').to.be.a('number');
                expect(res.body.data[0]).to.have.property('profile_image').to.be.a('string');
                expect(res.body.data[0]).to.have.property('profile_name').to.be.a('string');
                expect(res.body.data[0]).to.have.property('profile_bio').to.be.a('string');
                expect(res.body.data[0]).to.have.property('username').to.be.a('string');
                done();
            }).catch((err) => done(err));
        });
        
        
        it('should follow an account', (done) => {
            request(app)
            .post('/api/profile/user2/follow')
            .auth(token, {type: "bearer"})
            .send({user_to_follow_id: profileId})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('following').to.be.equal(true);
                request(app)
                .get('/api/profile/user2')
                .auth(token, {type: "bearer"})
                .expect(200)
                .then((res) => {
                    expect(res.body.data.followers).to.be.equal(tempFollowersCount+1);
                    done();
                })
            }).catch((err) => done(err));
        });

        it('should delete a follow', (done) => {
            request(app)
            .delete('/api/profile/user2/follow')
            .auth(token, {type: "bearer"})
            .send({user_to_follow_id: profileId})
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('following').to.be.equal(false);
                request(app)
                .get('/api/profile/user2')
                .auth(token, {type: "bearer"})
                .expect(200)
                .then((res) => {
                    expect(res.body.data.followers).to.be.equal(tempFollowersCount);
                    done();
                })
            }).catch((err) => done(err));
        });
    });  
});

const checkProfileProperties = (profile) => {
    expect(profile).to.have.property('profile_id').to.be.a('number');
    expect(profile).to.have.property('profile_header').to.be.a('string');
    expect(profile).to.have.property('profile_image').to.be.a('string');
    expect(profile).to.have.property('profile_name').to.be.a('string');
    expect(profile).to.have.property('profile_bio').to.be.a('string');
    expect(profile).to.have.property('username').to.be.a('string');
    expect(profile).to.have.property('followers').to.be.a('number');
    expect(profile).to.have.property('following').to.be.a('number');
    expect(profile).to.have.property('is_following').to.be.a('number');
};