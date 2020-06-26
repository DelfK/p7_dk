const employeeRouter = require('express').Router();

// import the employee model
const Employee = require('../models/employee');

// Login
employeeRouter.get('/login', (req, res, next) => {
res.send('Login')
});

// Signin
employeeRouter.get('/signin', (req, res, next) => {
    res.send('Signin')
    });


module.exports = employeeRouter;