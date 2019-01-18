//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const User = require('../models/').User;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
//Require the app
const app = require('../appHttp');

const should = chai.should();
let agent = chai.request.agent(app); // request agent used to mantain cookies between requests
let bearerToken = '';
let expiredBearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwaXJlcyI6IjIwMTgtMDEtMTZUMTM6MzM6NTQuMjQ5WiJ9.NKoGPFJ2nN5p7WWYefXB_veVf1fMGxPvtsV-erZ-iPU';


describe('Users', () => {
    // Clean existing user data
    before(function (done) {
        User.sync({
            force: true
        }) // drops table and re-creates it
        .then(function () {
            done(null);
        }, function (err) {
            done(err);
        });
    },
    after(function (done) {
        agent.close();
        User.sync({
            force: true
        }) // drops table and re-creates it
        .then(function () {
            done(null);
        }, function (err) {
            done(err);
        });
    }));

    /*
     * Test /api/user and create user method
     */
    describe('/POST user', () => {
        it('it should create a valid user', (done) => {
            const user = {
                email: "user123@mail.com",
                password: "uns4f3P4ss0rd",
                confirmPassword: "uns4f3P4ss0rd"
            }
            chai.request(app)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username');
                    res.body.should.have.property('username').eql(user.email);
                    done();
                });
        });

        it('it should not allow different passwords', (done) => {
            const user = {
                email: "otheruser@mail.com",
                password: "uns4f3P4ss0rd",
                confirmPassword: "unsafepassword"
            }
            chai.request(app)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('msg');
                    res.body.errors[0].should.have.property('msg').eql('Passwords don\'t match');
                    done();
                });
        });

        it('it should not allow dupplicate users', (done) => {
            const user = {
                email: "user123@mail.com",
                password: "anotherpassword",
                confirmPassword: "anotherpassword"
            }
            chai.request(app)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors')
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('message');
                    res.body.errors[0].should.have.property('message').eql('email must be unique');
                    done();
                });
        });

        it('it should not allow users with empty password', (done) => {
            const user = {
                email: "newuser@mail.com",
                password: "",
                confirmPassword: ""
            }
            chai.request(app)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('msg');
                    res.body.errors[0].should.have.property('msg').eql('Invalid value');
                    done();
                });
        });
    });

    describe('/POST login', () => {
        it('it should login an existent user', (done) => {
            const user = {
                username: "user123@mail.com",
                password: "uns4f3P4ss0rd",
            }
            agent
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    bearerToken = res.body.access_token;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('access_token');
                    res.body.access_token.should.be.a('string');
                    done();
                });
        });

        it('it should not login user with incorrect password', (done) => {
            const user = {
                username: "user123@mail.com",
                password: "somepassword",
            }
            chai.request(app)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('it should not login non-existing user', (done) => {
            const user = {
                username: "newuser@mail.com",
                password: "somepassword",
            }
            chai.request(app)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('/GET checkSessionToken', () => {
        it('it should validate valid session', (done) => {
            agent
                .get('/api/user/checkSessionToken')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.have.property('status');
                    res.body.status.should.be.a('string');
                    res.body.should.have.property('status').eql('Ok');
                    done();
                });
        });

        it('it should not validate invalid session', (done) => {
            agent
                .get('/api/user/checkSessionToken')
                .set('Authorization', 'Bearer tkn')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('it should not validate expired session', (done) => {
            agent
                .get('/api/user/checkSessionToken')
                .set('Authorization', 'Bearer ' + expiredBearerToken)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('/POST logout', () => {
        it('it should logout a valid session', (done) => {
            agent
                .post('/api/logout')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('it should not logout an invalid session', (done) => {
            agent
                .post('/api/logout')
                .set('Authorization', 'Bearer ' + expiredBearerToken)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('it should not validate session after logout', (done) => {
            agent
                .get('/api/user/checkSessionToken')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});