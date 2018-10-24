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
        .all()
        .then(testCases=> res.status(200).send(testCases))
        .catch(error => res.status(400).send(error));
    },
    retrieve(req, res) {
        return TestCase
        .findById(req.params.testID)
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
        .findById(req.params.testID)
        .then(testCase => {
            if (!testCase) {
                return res.status(400).send({
                    message: 'TestCase Not Found',
                });
            }
            return testCase
            .destroy()
            .then(() => res.status(200).send({ message: 'Test deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    },
};
