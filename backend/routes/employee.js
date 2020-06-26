const employeeRouter = require('express').Router();

// Login
employeeRouter.get('/login', (req, res, next) => {
res.send('Login')
});

// Signin
employeeRouter.get('/signin', (req, res, next) => {
    res.send('Signin')
    });


module.exports = employeeRouter;