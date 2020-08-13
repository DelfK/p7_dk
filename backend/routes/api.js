const apiRouter = require('express').Router();
const employeeRouter = require('./employee');

// mount all the routes on /employee path
apiRouter.use('/employee', employeeRouter);

module.exports = apiRouter;