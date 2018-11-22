const TestSuite = require('../models').TestSuite;

module.exports = {
    create(req, res) {
        return TestSuite
        .create({
            name: req.body.name,
            description: req.body.description
        })
        .then(test_suite => res.status(201).send(test_suite))
        .catch(error => res.status(400).send(JSON.parse(error)));
    },
    list(req, res) {
        return TestSuite
        .findAll()
        .then(testSuites=> res.status(200).send(testSuites))
        .catch(error => res.status(400).send(error));
    },
    retrieve(req, res) {
        return TestSuite
        .findByPk(req.params.testSuiteID,  {
          include: [{
            model: test_cases,
            as: 'testCases',
          }],
        })
        .then(testSuite => {
            if (!testSuite) {
                return res.status(404).send({
                    message: 'Test Suite Not Found',
                });
            }
            return res.status(200).send(testSuite);
        })
        .catch(error => res.status(400).send(error));
    },
    destroy(req, res) {
        return TestSuite
        .findByPk(req.params.testSuiteID)
        .then(testSuite => {
            if (!testSuite) {
                return res.status(400).send({
                    message: 'TestSuite Not Found',
                });
            }
            return testSuite
            .destroy()
            .then(() => res.status(200).send({ message: 'Test Suite deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    },
};
