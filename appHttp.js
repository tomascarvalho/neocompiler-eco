require('dotenv').config();
const express = require('express');
const http = require('http');
const logger = require('morgan'); // log requests to the console (express4)
const app = express();
const bodyParser = require('body-parser'); // pull information from HTML POST (express4)
const session = require('express-session');
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer');

app.use(express.static(__dirname + '/')); // set the static files location /public/img will be /img for users
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'set secret in production', // try to load secret from .env
    cookie: {}
}));

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV != 'test') {
    app.use(logger('dev')); // log every request to the console
}

app.use(bodyParser.urlencoded({ // parse application/x-www-form-urlencoded
    parameterLimit: 100000, // bigger parameter sizes
    limit: '5mb', // bigger parameter sizes
    extended: false
}));
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json

app.set('jwtTokenSecret', process.env.JWT_TOKEN_SECRET || 'SETSECRETINPRODUCTION');


const server = http.createServer(app);

const testController = require('./controllers').test_cases;
const userController = require('./controllers').user;
const testSuiteController = require('./controllers').test_suite;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jwt-simple');
const {
    check,
    validationResult
} = require('express-validator/check');

// This is used for auth. http://www.passportjs.org/docs/
passport.use(new LocalStrategy(
    function (email, password, done) {
        userController.getUserByEmail(email).then(function (user) {
            if (!user) {
                return done(null, false, {
                    message: 'Invalid email or password.'
                });
            }
            bcrypt.compare(password, user.password, function (err, res) {
                if (res) {
                    let expires = new Date();
                    expires.setDate((new Date()).getDate() + 5);
                    let token = jwt.encode({
                        id: user.id,
                        expires: expires
                    }, app.get('jwtTokenSecret')); // get this from env

                    user.token = token;
                    user.save().then(() => {
                        return done(null, user);
                    })
                } else {
                    return done(null, false, {
                        message: 'Invalid email or password.'
                    })
                }
            });
        });
    }
));

passport.use(new BearerStrategy(
    function (token, done) {
        userController.getUserByToken(token).then(function (user) {
            let decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
            if (!user) {
                return done(null, false);
            }
            if (new Date(decodedToken.expires) < new Date() || user.id != decodedToken.id) {
                user.token = null;
                return done(null, false);
            }
            return done(null, user, {
                scope: 'all'
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

server.listen(8000 || process.env.PORT, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log('Index.html server page is up')
})

// ============================================================
// ================== Test Cases ==============================

app.post('/api/test_case',
    function (req, res, next) {
        console.log(req.body);
        next();
    },
    testController.create);

app.get('/api/test_cases/',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
        }
        next();
    },
    passport.authenticate('bearer'),
    testController.list
);

app.get('/api/test_case/:testID', testController.retrieve);

app.delete('/api/test_case/:testID',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
        }
        next();
    },
    passport.authenticate('bearer'),
    testController.destroy
);

app.put('/api/test_case/:testID',
    testController.update
);

app.put('/api/test_case/:testID/test_suite/:testSuiteID',
    testController.testSuite
);

// ============================================================
// ================== Test Suites =============================
//

app.post('/api/test_suite/', testSuiteController.create);

app.get('/api/test_suite/:testSuiteID', testSuiteController.retrieve);

app.get('/api/test_suites/',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
        }
        next();
    },
    passport.authenticate('bearer'),
    testSuiteController.list
);

app.put('/api/test_suite/:testSuiteID',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
        }
        next();
    },
    passport.authenticate('bearer'),
    testSuiteController.update
)

app.delete('/api/test_suite/:testSuiteID',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
        }
        next();
    },
    passport.authenticate('bearer'),
    testSuiteController.destroy
);

// ============================================================
// ================== Users ===================================

app.post('/api/user', [
        check('email').isEmail(),
        check('password')
            .isLength({min: 6 })
            .custom((value,{req, loc, path}) => {
                if (value !== req.body.confirmPassword) {
                    // trow error if passwords do not match
                    throw new Error("Passwords don't match");
                } else {
                    return value;
                }
            })
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            req.body.password = hash;
            next()
        });
    },
    userController.create,
);

app.get('/api/user/checkSessionToken',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
            return;
        }
        next();
    },
    passport.authenticate('bearer'),
    function (req, res) {
        res.status(200).send({
            status: "Ok"
        });
    }
);

app.post('/api/login',
    // Checks if user exists and if credentials match and generates a new session token
    passport.authenticate('local'),
    function (req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        req.login(req.user, (err) => {
            if (err) {
                res.status(500).send("Internal Server Error");
                return;
            }
        });
        res.status(200).send({
            access_token: req.user.token
        });
    });

app.post('/api/logout/',
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401).send({
                status: "Unauthorized"
            });
            return;
        }
        next();
    },
    passport.authenticate('bearer'),
    function (req, res) {
        let user = req.user;
        user.token = null;
        user.save().then(() => {
            req.session.destroy(function (err) {
                if (err) {
                    res.status(500).send("Internal Server Error");
                    return;
                }
                res.status(200).send("OK");
            })
        });
    });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

module.exports = app;