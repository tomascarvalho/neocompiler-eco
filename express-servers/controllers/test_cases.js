const TestCase = require('../models').TestCase;

module.exports = {
  create(req, res) {
    return TestCase
      .create({
        contract_hash: req.body.contract_hash,
        event_type: req.body.event_type,
        expected_payload_type: req.body.expected_payload_type,
        expected_payload_value: req.body.expected_payload_value,
        active: req.body.active,
      })
      .then(test_case => res.status(201).send(test_case))
      .catch(error => res.status(400).send(error));
  },
};
