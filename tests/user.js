//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const User = require('../models/').User;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
//Require the app
const app = require('../appHttp');

const should = chai.should();


chai.use(chaiHttp);
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
    });

    /*
     * Test /api/user and create user method
     */
    describe('/POST user', () => {
        it('it should create a valid user', (done) => {
            const user = {
                email: "testuser@mail.com",
                password: "uns4f4P4ss0rd",
                confirmPassword: "uns4f4P4ss0rd"
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
                email: "testuser@mail.com",
                password: "uns4f4P4ss0rd",
                confirmPassword: "unsafepassword"
            }
            chai.request(app)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status');
                    res.body.should.have.property('status').eql('Passwords don\'t match');
                    done();
                });
                
        });

        it('it should not allow dupplicate users', (done) => {
            const user = {
                email: "testuser@mail.com",
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
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status');
                    res.body.should.have.property('status').eql('Password must have more than 6 chars');
                    done();
                });
               
        });
    });

    describe('/POST login', () => {
        it('it should login an existent user', (done) => {
            const user = {
                username: "testuser@mail.com",
                password: "uns4f4P4ss0rd",
            }
            chai.request(app)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('access_token');
                    done();
                });
                
        });
    });

});