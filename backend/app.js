// Import express
const express = require('express');

// import body-parser
const bodyParser = require('body-parser');

// import path
const path = require('path');

//import cors
const cors = require('cors')

// create the server
const app = express();

// setting the response header for the preflight requests
let optionsCors = { 
  //Access-Control-Allow-Origin CORS header from all domains with wildcard
  origin: "*",
  //Access-Control-Allow-Methods CORS header
  methods: "GET,PUT,POST,DELETE",
  // Access-Control-Allow-Headers CORS header
  allowedHeaders: "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"       
}

// allowing cors requests for all routes with configuration
app.use(cors(optionsCors));

// use body-parser on all routes
app.use(bodyParser.json());


// serving static images from the images folder with express static
  app.use('/images', express.static(path.join(__dirname, 'images')));


// Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);


// Setting the port
const PORT = process.env.PORT || 4000;

// Run the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});