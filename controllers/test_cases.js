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
        })
        .then(test_case => res.status(201).send(test_case))
        .catch(error => res.status(400).send(JSON.parse(error)));
    },
    list(req, res) {
        return TestCase
        .findAll({where: { userId: req.user.id }})
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
            if (testCase.userId != req.user.id) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return test_case
            .update({
                name: req.body.name || test_case.name,
                description: req.body.description || test_case.description,
                constract_hash: req.body.contractHash || test_case.contract_hash
            })
            .then(() => res.status(200).send(test_case))  // Send back the updated test_case.
            .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
    },
    assignUser(req, res) {
        return TestCase
        .findByPk(req.body.testID)
        .then(test_case => {
            console.log(test_case.userId);
            if (!test_case) {
                return res.status(404).send({
                    message: 'TestCase Not Found',
                });
            }
            if (test_case.userId != null) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return test_case
            .update({
                userId: req.user.id || test_case.userId,
            })
            .then(() => res.status(200).send(test_case))  // Send back the updated test_case.
            .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
    },

};
