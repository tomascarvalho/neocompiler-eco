const TestCase = require('../models').TestCase;
const TestSuite = require('../models').TestSuite;

module.exports = {
    create(req, res) {
        return TestCase
        .create({
            contract_hash: req.body.contract_hash,
            transaction_hash: req.body.transaction_hash || 'N/A',
            event_type: req.body.event_type,
            expected_payload_type: req.body.expected_payload_type,
            expected_payload_value: req.body.expected_payload_value,
            active: req.body.active || null,
            attachgasfeejs: req.body.attachgasfeejs,
            attachneojs: req.body.attachneojs,
            attachgasjs: req.body.attachgasjs,
            wallet_invokejs: req.body.wallet_invokejs,
            invokehashjs: req.body.invokehashjs,
            invokeparamsjs: req.body.invokeparamsjs,
            name: req.body.name || null,
            description: req.body.description || null,
            success: false,
        })
        .then(test_case => res.status(201).send(test_case))
        .catch(error => res.status(400).send(error));
    },
    list(req, res) {
        return TestCase
        .findAll({where: {
            userId: req.user.id,
            testSuiteId: null
        }})
        .then(testCases=> res.status(200).send(testCases))
        .catch(error => res.status(400).send(error));
    },
    retrieve(req, res) {
        return TestCase
        .findByPk(req.params.testID)
        .then(testCase => {
            if (!testCase) {
                return res.status(404).send({
                    message: 'Test Case Not Found',
                });
            }
            return res.status(200).send(testCase);
        })
        .catch(error => res.status(400).send(error));
    },
    destroy(req, res) {
        return TestCase
        .findByPk(req.params.testID)
        .then(testCase => {
            if (!testCase) {
                return res.status(400).send({
                    message: 'TestCase Not Found',
                });
            } if (testCase.userId != req.user.id) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return testCase
            .destroy()
            .then(() => res.status(200).send({ message: 'Test deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    },
    update(req, res) {
        return TestCase
        .findByPk(req.params.testID)
        .then(test_case => {
            if (!test_case) {
                return res.status(404).send({
                    message: 'TestCase Not Found',
                });
            }
            if (test_case.userId != null && !req.user) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            if (test_case.userId != null && test_case.userId != req.user.id && !req.isAuthenticated()) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            let userId = null;
            if (req.user) {
                userId = req.user.id;
            }
            return test_case
            .update({
                name: req.body.name || test_case.name,
                description: req.body.description || test_case.description,
                contract_hash: req.body.contract_hash || test_case.contract_hash,
                userId: userId || test_case.userId,
                transaction_hash: req.body.transaction_hash || test_case.transaction_hash,
                event_type: req.body.event_type || test_case.event_type,
                expected_payload_type: req.body.expected_payload_type || test_case.expected_payload_type,
                expected_payload_value: req.body.expected_payload_value || test_case.expected_payload_value,
                active: req.body.active || test_case.active,
                attachgasfeejs: req.body.attachgasfeejs || test_case.attachgasfeejs,
                attachneojs: req.body.attachneojs || test_case.attachneojs,
                attachgasjs: req.body.attachgasjs || test_case.attachgasjs,
                wallet_invokejs: req.body.wallet_invokejs || test_case.wallet_invokejs,
                invokehashjs: req.body.invokehashjs || test_case.invokehashjs,
                invokeparamsjs: req.body.invokeparamsjs || test_case.invokeparamsjs,
                success: req.body.success || test_case.success,
                gas_cost: req.body.gas_cost || test_case.gas_cost
            })
            .then(() => res.status(200).send(test_case))  // Send back the updated test_case.
            .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
    },
    testSuite(req, res) {
        return TestCase
        .findByPk(req.params.testID)
        .then(test_case => {
            if (!test_case) {
                return res.status(404).send({
                    message: 'TestCase Not Found',
                });
            }
            if (test_case.userId != null && test_case.userId != req.user.id && !req.isAuthenticated()) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return TestSuite
            .findByPk(req.params.testSuiteID)
            .then(test_suite => {
                if (test_suite && test_suite.userId != null && test_suite.userId != req.user.id && !req.isAuthenticated()) {
                    return res.status(403).send({
                        message: 'Forbidden!',
                    });
                }
                if (req.params.testSuiteID == 0) {
                    req.params.testSuiteID = null;
                }

                if (req.user) {
                    req.params.userID = req.user.id;
                }

                return test_case
                .update({
                    testSuiteId: req.params.testSuiteID,
                    userId: req.params.userID,
                })
                .then(() => res.status(200).send(test_case))  // Send back the updated test_case.
                .catch((error) => res.status(400).send(error));

            })
           
        })
        .catch((error) => { console.log(error); res.status(400).send(error); });
    },

};
