// import jsonwebtoken to create authorization on routes
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');


// create a middleware to make sure only authorized requests (the ones with a token and a role of moderator) 
// can access the moderation of comments
module.exports = (req, res, next) => {
  
    // get the token in the request header
    const token = req.headers.authorization.split(' ')[1];

    // use verify() to decode the token
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // get the user id from the decoded token
    const employeeId = decodedToken.employeeId;

    db.get('SELECT Employee.role FROM Employee WHERE Employee.id = $employeeId', { $employeeId: employeeId}, (err, employee) => {
       if(err){
           next(err);
           
       } else if (employee && employee.role === "moderator"){
        next()
       } else {
        res.status(401).json({ error: "Sorry, but you don't have the permissions to do that" });
          
       }
       
    })
    
  
};