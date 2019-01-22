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
let agent = chai.request.agent(app); // request agent used to maintain cookies between requests
let bearerToken = '';
let expiredBearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwaXJlcyI6IjIwMTgtMDEtMTZUMTM6MzM6NTQuMjQ5WiJ9.NKoGPFJ2nN5p7WWYefXB_veVf1fMGxPvtsV-erZ-iPU';

const user = {
    email: "user321@mail.com",
    password: "uns4f3P4ss0rd",
    confirmPassword: "uns4f3P4ss0rd",
    username: "user321@gmail.com"
}


describe('Test Cases', () => {
    // Clean existing test case data
    before(function (done) {
        TestCase.sync({
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
        TestCase.sync({
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
                    res.body.should.have.property('id').eql(1);
                    done();
                });
        });

        it('should be able to create another valid test case', (done) => {
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
        it('should be able to edit an unsaved test case', (done) => {
            const edited_test_case = {
                name: "New Test Case Name",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                event_type: "SmartContract.Runtime.Notify",
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
                .put('/api/test_case/1')
                .send(edited_test_case)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        // it('should not be able to edit an unowned test case with invalid contract_hash', (done) => {
        //     const edited_test_case = {
        //         name: "New Test Case Name",
        //         description: "Test Case Description",
        //         contract_hash: "3943e22ece4921isafaj7c790aa510e9cb211bb3d",
        //         event_type: "SmartContract.Runtime.Notify",
        //         expected_payload_type: "String",
        //         expected_payload_value: "Contract was called",
        //         attachgasfeejs: "0",
        //         attachneojs: "0",
        //         attachgasjs: "0",
        //         wallet_invokejs: "wallet_0",
        //         invokehashjs: "3943e22ece58327eca17c790aa510e9cb211bb3d",
        //         invokeparamsjs: "[{\"type\":\"String\",\"value\":\"query\"},{\"type\":\"Array\",\"value\":[{\"type\":\"String\",\"value\":\"test.com\"}]}]"
        //     }
        //     chai.request(app)
        //         .put('/api/test_case/1')
        //         .send(edited_test_case)
        //         .end((err, res) => {
        //             res.should.have.status(422);
        //             res.body.should.have.property('errors');
        //             res.body.should.be.a('object');
        //             res.body.should.have.property('errors');
        //             res.body.errors.should.be.a('array');
        //             res.body.errors[0].should.be.a('object');
        //             res.body.errors[0].should.have.property('msg');
        //             res.body.errors[0].should.have.property('param');
        //             res.body.errors[0].should.have.property('param').eql('contract_hash');
        //             res.body.errors[0].should.have.property('msg').eql('Invalid value');
        //             done();
        //         });
        // });

        // it('should not be able to edit an unowned test case with invalid event_type', (done) => {
        //     const edited_test_case = {
        //         name: "New Test Case Name",
        //         description: "Test Case Description",
        //         contract_hash: "3943e22ece4921isafaj7c790aa510e9cb211bb3d",
        //         event_type: "DumbContrat.Runtime.Notify",
        //         expected_payload_type: "String",
        //         expected_payload_value: "Contract was called",
        //         attachgasfeejs: "0",
        //         attachneojs: "0",
        //         attachgasjs: "0",
        //         wallet_invokejs: "wallet_0",
        //         invokehashjs: "3943e22ece58327eca17c790aa510e9cb211bb3d",
        //         invokeparamsjs: "[{\"type\":\"String\",\"value\":\"query\"},{\"type\":\"Array\",\"value\":[{\"type\":\"String\",\"value\":\"test.com\"}]}]"
        //     }
        //     chai.request(app)
        //         .put('/api/test_case/1')
        //         .send(edited_test_case)
        //         .end((err, res) => {
        //             res.should.have.status(422);
        //             res.body.should.have.property('errors');
        //             res.body.should.be.a('object');
        //             res.body.should.have.property('errors');
        //             res.body.errors.should.be.a('array');
        //             res.body.errors[0].should.be.a('object');
        //             res.body.errors[0].should.have.property('msg');
        //             res.body.errors[0].should.have.property('param');
        //             res.body.errors[0].should.have.property('param').eql('contract_hash');
        //             res.body.errors[0].should.have.property('msg').eql('Invalid value');
        //             done();
        //         });
        // });

     
        it('it should create a valid user', (done) => {
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

        it('it should login an existent user', (done) => {
            const user = {
                username: "user321@mail.com",
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

        it ('should be able to own an unowned test if authenticated', (done) => {
            agent
                .put('/api/test_case/1')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it ('should not be able to own an unowned test if not authenticated', (done) => {
            chai.request(app)
                .put('/api/test_case/2')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userId').eql(null);
                    done();
                });
        });

        it('should be able to edit his saved test case', (done) => {
            const edited_test_case = {
                name: "A meaningful name!",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                event_type: "SmartContract.Runtime.Notify",
                expected_payload_type: "String",
                expected_payload_value: "Contract was called",
                attachgasfeejs: "0",
                attachneojs: "0",
                attachgasjs: "0",
                wallet_invokejs: "wallet_0",
                invokehashjs: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                invokeparamsjs: "[{\"type\":\"String\",\"value\":\"query\"},{\"type\":\"Array\",\"value\":[{\"type\":\"String\",\"value\":\"test.com\"}]}]"
            }
            agent
                .put('/api/test_case/1')
                .set('Authorization', 'Bearer ' + bearerToken)
                .send(edited_test_case)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userId');
                    res.body.should.have.property('userId').eql(1);
                    done();
                });
        });

        it('should not be able to edit other\'s saved test case', (done) => {
            const edited_test_case = {
                name: "I dont care about names!",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                event_type: "SmartContract.Runtime.Notify",
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
                .put('/api/test_case/1')
                .send(edited_test_case)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('should not be able to edit an unexistent test case', (done) => {
            const edited_test_case = {
                name: "I dont care about names!",
                description: "Test Case Description",
                contract_hash: "3943e22ece58327eca17c790aa510e9cb211bb3d",
                event_type: "SmartContract.Runtime.Notify",
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
                .put('/api/test_case/125')
                .send(edited_test_case)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe('/GET test case', () => {
        it('should be able to get an existing test case', (done) => {
            chai.request(app)
                .get('/api/test_case/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('should not be able to get a non-existing test case', (done) => {
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

    describe('/GET test cases', () => {
        it('should be able to list all owned test cases', (done) => {
            agent
                .get('/api/test_cases')
                .set('Authorization', 'Bearer ' + bearerToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it('should not be able to list unowned test cases', (done) => {
            chai.request(app)
                .get('/api/test_cases')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('/DELETE test cases', () => {
        it('should not be able to delete an unowned test case', (done) => {
            chai.request(app)
                .delete('/api/test_case/1')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should be able to delete an owned test case', (done) => {
            agent
            .delete('/api/test_case/1')
            .set('Authorization', 'Bearer ' + bearerToken)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
    });
});