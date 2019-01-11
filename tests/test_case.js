//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the models so the database can be cleaned
const TestCase = require('../models/').TestCase;
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


describe('Test Cases', () => {
    // Clean existing user data
    before(function (done) {
        TestCase.sync({
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
        done(null);
    }));

    describe('/POST test case', () => {
        it('should be able to create a valid test case', (done) => {
            const test_case = {
                name: "Test Case Name",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
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
            chai.request(app)
                .post('/api/test_case')
                .send(test_case)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('should not be able to create a test case with invalid contract hash', (done) => {
            const test_case = {
                name: "Test Case Name",
                description: "Test Case Description",
                contract_hash: "asnfoan",
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
            chai.request(app)
                .post('/api/test_case')
                .send(test_case)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.should.have.property('errors');
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('msg');
                    res.body.errors[0].should.have.property('param');
                    res.body.errors[0].should.have.property('param').eql('contract_hash');
                    res.body.errors[0].should.have.property('msg').eql('Invalid value');
                    done();
                });
        });

        it('should not be able to create a test case with an empty contract hash', (done) => {
            const test_case = {
                name: "Test Case Name",
                description: "Test Case Description",
                contract_hash: "",
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
            chai.request(app)
                .post('/api/test_case')
                .send(test_case)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.should.have.property('errors');
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('msg');
                    res.body.errors[0].should.have.property('param');
                    res.body.errors[0].should.have.property('param').eql('contract_hash');
                    res.body.errors[0].should.have.property('msg').eql('Invalid value');
                    done();
                });
        });

        it('should not be able to create a test case with an invalid event type', (done) => {
            const test_case = {
                name: "Test Case Name",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                event_type: "RandomEvent",
                expected_payload_type: "String",
                expected_payload_value: "Contract was called",
                attachgasfeejs: "0",
                attachneojs: "0",
                attachgasjs: "0",
                wallet_invokejs: "wallet_0",
                invokehashjs: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                invokeparamsjs: "[{\"type\":\"String\",\"value\":\"query\"},{\"type\":\"Array\",\"value\":[{\"type\":\"String\",\"value\":\"test.com\"}]}]"
            }
            chai.request(app)
                .post('/api/test_case')
                .send(test_case)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.should.have.property('errors');
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.be.a('array');
                    res.body.errors[0].should.be.a('object');
                    res.body.errors[0].should.have.property('msg');
                    res.body.errors[0].should.have.property('param');
                    res.body.errors[0].should.have.property('param').eql('event_type');
                    res.body.errors[0].should.have.property('msg').eql('Invalid value');
                    done();
                });
        });        
    });

    describe('/PUT test case', () => {
        it('should be able to create a valid test case', (done) => {
            const test_case = {
                name: "Test Case Name",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
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

    describe('/GET test case', () => {
        it('non authenticated user should be able to get the created (unowned) test case', (done) => {
            chai.request(app)
                .get('/api/test_case/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('user should not be able to get a non-existing test case', (done) => {
            chai.request(app)
                .get('/api/test_case/115215')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.message.should.be.a('string');
                    res.body.should.have.property('message').eql('Test Case Not Found');
                    done();
                });
        });
    });

    describe('/POST login', () => {
        it('it should login an existent user', (done) => {
            const user = {
                username: "testuser@mail.com",
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
    });
});