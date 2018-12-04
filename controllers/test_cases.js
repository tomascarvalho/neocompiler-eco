const TestCase = require('../models').TestCase;

module.exports = {
    create(req, res) {
        return TestCase
        .create({
            contract_hash: req.body.contract_hash,
            transaction_hash: req.body.transaction_hash,
            event_type: req.body.event_type,
            expected_payload_type: req.body.expected_payload_type,
            expected_payload_value: req.body.expected_payload_value,
            active: req.body.active,
            attachgasfeejs: req.body.attachgasfeejs,
            attachneojs: req.body.attachneojs,
            attachgasjs: req.body.attachgasjs,
            wallet_invokejs: req.body.wallet_invokejs,
            invokehashjs: req.body.invokehashjs,
            invokeparamsjs: req.body.invokeparamsjs,
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
            if (test_case.userId != null && test_case.userId != req.user.id) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return test_case
            .update({
                name: req.body.name || test_case.name,
                description: req.body.description || test_case.description,
                contract_hash: req.body.contract_hash || test_case.contract_hash,
                userId: req.user.id || test_case.userId,
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
            // if (test_case.testSuiteId != null) {
            //     return res.status(403).send({
            //         message: 'Forbidden!',
            //     });
            // }
            return test_case
            .update({
                testSuiteId: req.params.testSuiteID || test_case.testSuiteId,
            })
            .then(() => res.status(200).send(test_case))  // Send back the updated test_case.
            .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
    },

};
