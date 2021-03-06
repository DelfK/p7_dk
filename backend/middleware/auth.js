// import jsonwebtoken to create authorization on routes
const jwt = require('jsonwebtoken');


// create a middleware to make sure only authorized requests (the ones with a token) 
// can access the post, put and delete routes
module.exports = (req, res, next) => {
  try {
    // get the token in the request header
    // as the token contains the word Bearer, use split to get the string after it
    const token = req.headers.authorization.split(' ')[1];

    // use verify() to decode the token
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // get the user id from the decoded token
    const employeeId = decodedToken.employeeId;

    next();
  } catch(err) {
    // send an error
    res.status(401).json({
      error: err
    });
  }
};