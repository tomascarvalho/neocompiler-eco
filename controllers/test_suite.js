const TestSuite = require('../models').TestSuite;
const TestCase = require('../models').TestCase;

module.exports = {
    create(req, res) {
        return TestSuite
        .create({
            name: req.body.name,
            description: req.body.description
        })
        .then(test_suite => res.status(200).send(test_suite))
        .catch(error => res.status(400).send(error));
    },
    list(req, res) {
        return TestSuite
        .findAll({
          where: {
              userId: req.user.id
          },
          include: [{
            model: TestCase,
            as: 'testCases',
          }]
        })
        .then(testSuites=> res.status(200).send(testSuites))
        .catch(error => res.status(400).send(error));
    },
    retrieve(req, res) {
        return TestSuite
        .findByPk(req.params.testSuiteID,  {
          include: [{
            model: TestCase,
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
            } else if (testSuite.userId != null && testSuite.userId != req.user.id) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return testSuite
            .destroy()
            .then(() => res.status(200).send({ message: 'Test Suite deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    },
    update(req, res) {
        return TestSuite
        .findByPk(req.params.testSuiteID)
        .then(test_suite => {
            if (!test_suite) {
                return res.status(404).send({
                    message: 'TestSuite Not Found',
                });
            }
            if (test_suite.userId != null && test_suite.userId != req.user.id) {
                return res.status(403).send({
                    message: 'Forbidden!',
                });
            }
            return test_suite
            .update({
                name: req.body.name || test_suite.name,
                description: req.body.description || test_suite.description,
                userId: req.user.id || test_suite.userId,
            })
            .then(() => res.status(200).send(test_suite))  // Send back the updated test_suite.
            .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
    }
};
