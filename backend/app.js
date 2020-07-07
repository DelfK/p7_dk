// Import express
const express = require('express');

// import body-parser
const bodyParser = require('body-parser');

// import path
const path = require('path');

// import express-session
//const session= require('express-session');

// create the server
const app = express();

// use body-parser on all routes
app.use(bodyParser.json());


// serving static images from the images folder with express static
  // using the path /images to serve the images from the folder /images
  // getting the images from a static folder using the absolute path with the root folder dirname
  // result > https://localhost:3000/images/[filename]
  app.use('/images', express.static(path.join(__dirname, 'images')));

// use session
/*app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));*/

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