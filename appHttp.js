var express  = require('express');
var http = require('http');
var logger = require('morgan');             // log requests to the console (express4)
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var session = require('express-session');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy, BearerStrategy = require('passport-http-bearer');

app.use(express.static(__dirname + '/'));                 // set the static files location /public/img will be /img for users
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'secret secret pumpkin eater'
})); // We should probably get this from env

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({                                 // parse application/x-www-form-urlencoded
    parameterLimit: 100000,                // bigger parameter sizes
    limit: '5mb',                          // bigger parameter sizes
    extended: false
}));
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.set('jwtTokenSecret', '123456ABCDEF');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


var server = http.createServer(app);

const testController = require('./controllers').test_cases;
const userController = require('./controllers').user;

const bcrypt = require('bcrypt');
const saltRounds = 10;



var User = require('./models').User;

var jwt = require('jwt-simple');

// This is used for auth. http://www.passportjs.org/docs/
passport.use(new LocalStrategy(
    function(email, password, done) {
        User.findOne({ where: { email: email }}).then(function (user, err) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Invalid email or password.' });
            }
            bcrypt.compare(password, user.password, function(err, res) {
                if(res) {
                    var expires = new Date();
                    expires.setDate((new Date()).getDate() + 5);
                    var token = jwt.encode({
                        username: user.email,
                        expires: expires
                    }, app.get('jwtTokenSecret')); // get this from env

                    user.token = token;
                    user.save().then(() => {
                        return done(null, user);
                    })
                } else {
                    return done(null, false, { message: 'Invalid email or password.' })
                }
            });
        });
    }
));

passport.use(new BearerStrategy(
    function(token, done) {
        User.findOne({ where: {token: token }}).then(function (user, err) {
          var decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
          if (err) { return done(err); }
          if (!user) {
              return done(null, false);
          }
          if (new Date(decodedToken.expires) < new Date()) {
              user.token = null;
              return done(null, false);
          }
          return done(null, user, { scope: 'all' });
        });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
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

app.post('/test_case', testController.create); // change to api/test.... with auth

app.get('/test_cases', testController.list); // change to api/test.... with auth

app.get('/test_case/:testID', testController.retrieve); // change to api/test.... with auth

app.delete('/api/test_case/:testID',
    passport.authenticate('bearer'),
    testController.destroy
);  // change to api/test.... with auth

// ============================================================
// ================== Users ===================================

app.post('/api/user', function(req, res, next) {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            req.body.password = hash;
            next()
        });
    },
    userController.create,
);

app.post('/api/login',
    passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        var decodedToken = jwt.decode(req.user.token, app.get('jwtTokenSecret'));
        console.log(decodedToken);
        res.status(200).send({ access_token: req.user.token, username: req.user.email });
});

app.post('/api/logout',
    passport.authenticate('bearer'),
    function(req, res) {
        let user = req.user;
        user.token = null;
        user.save().then(() => {
            res.status(200).send("OK");
        });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
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
