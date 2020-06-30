// Import express
const express = require('express');

// import body-parser
const bodyParser = require('body-parser');

// import path
const path = require('path');

const session= require('express-session');

// create the server
const app = express();

// use body-parser on all routes
app.use(bodyParser.json());

// use session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));

// Testing a route
app.get('/', (req, res, next) => {
    res.send('This is only the beginning my friend!')
});

// Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);


// Setting the port
const PORT = process.env.PORT || 4000;

// Run the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});