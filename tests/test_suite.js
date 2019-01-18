//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the models so the database can be cleaned
const TestCase = require('../models/').TestCase;
const TestSuite = require('../models/').TestSuite;
const User = require('../models/').User;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
//Require the app
const app = require('../appHttp');

const should = chai.should();
let agent = chai.request.agent(app); // request agent used to maintain cookies between requests
let bearerToken = '';

const test_case = {
    name: "Second test case",
    description: "My Test Case Description",
    contract_hash: "5243e22ece12327eca17c790aa510e9cb211bb3d",
    event_type: "SmartContract.Runtime.Log",
    expected_payload_type: "String",
    expected_payload_value: "Contract was called",
    attachgasfeejs: "0",
    attachneojs: "0",
    attachgasjs: "0",
    wallet_invokejs: "wallet_0",
    invokehashjs: "3943e22ece58327eca17c790aa510e9cb211bb3d",
    invokeparamsjs: "[{\"type\":\"String\",\"value\":\"query\"},{\"type\":\"Array\",\"value\":[{\"type\":\"String\",\"value\":\"test.com\"}]}]"
}


describe('Test Suites', () => {
    // Clean existing test case data
    before(function (done) {
        TestSuite.sync({
            force: true
        }) // drops table and re-creates it
        .then(function () { // cleans users
            User.sync({
                force: true
            }) // drops table and re-creates it
            .then(function () {
                done(null);
            }, function (err) {
                done(err);
            });
        }, function (err) {
            done(err);
        })
    },
    after(function (done) {
        // close agent
        agent.close();
        // Clean existing test case data
        TestSuite.sync({
            force: true
        }) // drops table and re-creates it
        .then(function () { // cleans users
            User.sync({
                force: true
            }) // drops table and re-creates it
            .then(function () {
                done(null);
            }, function (err) {
                done(err);
            });
        }, function (err) {
            done(err);
        })
    }));

    describe('/POST test case', () => {
        it ('should post a test case', (done) => {
            chai.request(app)
            .post('/api/test_case')
            .send(test_case)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                done();
            });
        });
    });

    describe('/POST test suite', () => {
        it('should be able to create a valid test suite', (done) => {
            const test_suite = {
                name: "Test Suite Name",
                description: "Test Suite Description"
            }
            chai.request(app)
                .post('/api/test_suite')
                .send(test_suite)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('should not be able to create an invalid test suite', (done) => {
            const test_suite = {
                name: "",
                description: "Test Suite Description"
            }
            chai.request(app)
                .post('/api/test_suite')
                .send(test_suite)
                .end((err, res) => {
                    res.should.have.status(422);
                    done();
                });
        });
    });

    describe('/PUT test suite', () => {
        it('it should create a valid user', (done) => {
            let new_user = {
                email: "testuser@gmail.com",
                password: "uns4f3P4ss0rd",
                confirmPassword: "uns4f3P4ss0rd"
            }
            chai.request(app)
                .post('/api/user')
                .send(new_user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username');
                    res.body.should.have.property('username').eql(new_user.email);
                    done();
                });
        });

        it('it should login an existent user', (done) => {
            let login_user = {
                username: "testuser@gmail.com",
                password: "uns4f3P4ss0rd",
            }
            agent
                .post('/api/login')
                .send(login_user)
                .end((err, res) => {
                    bearerToken = res.body.access_token;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('access_token');
                    res.body.access_token.should.be.a('string');
                    done();
                });
        });

        it('should let authenticated user own a test suite', (done) => {
            agent
                .put('/api/test_suite/1')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        })

        it('should not let unauthenticated user own a test suite', (done) => {
            chai.request(app)
                .put('/api/test_suite/1')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('/DELETE test suite', () => {
        it('should not let unauthenticated user delete an owned test suite', (done) => {
            chai.request(app)
                .delete('/api/test_suite/1')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should let authenticated user delete his owned test suite', (done) => {
            agent
                .delete('/api/test_suite/1')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});