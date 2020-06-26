const apiRouter = require('express').Router();
const employeeRouter = require('./employee');

apiRouter.use('/employee', employeeRouter);

module.exports = apiRouter;