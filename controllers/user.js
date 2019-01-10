const User = require('../models').User;

module.exports = {
    create(req, res) {
        return User
            .create({
                email: req.body.email,
                password: req.body.password
            })
            .then(user => res.status(201).send({
                username: user.email
            }))
            .catch(error => res.status(400).send(error));
    },
    list(req, res) {
        return User
            .all()
            .then(users => res.status(200).send(users))
            .catch(error => res.status(400).send(error));
    },
    retrieve(req, res) {
        return User
            .findByPk(req.params.userID)
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: 'User Not Found',
                    });
                }
                return res.status(200).send(user);
            })
            .catch(error => res.status(400).send(error));
    },
    destroy(req, res) {
        return User
            .findByPk(req.params.userID)
            .then(user => {
                if (!user) {
                    return res.status(400).send({
                        message: 'User Not Found',
                    });
                }
                return user
                    .destroy()
                    .then(() => res.status(200).send({
                        message: 'User deleted successfully.'
                    }))
                    .catch(error => res.status(400).send(error));
            })
            .catch(error => res.status(400).send(error));
    },
    getUserByEmail(email) {
        return User
            .findOne({
                where: {
                    email: email
                }
            })
            .then(function (user, err) {
                if (err) {
                    return null;
                }
                return user;
            })
    },
    getUserByToken(token) {
        return User
            .findOne({
                where: {
                    token: token
                }
            })
            .then(function (user, err) {
                if (err) {
                    return null;
                }
                return user;
            })
    },

};