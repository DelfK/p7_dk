const employeeRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// import jsonwebtoken
const jwt = require('jsonwebtoken');

// import bcrypt
const bcrypt = require('bcrypt');

// LOGIN
employeeRouter.post('/login', (req, res, next) => {
const email = req.body.employee.email;
const values = {
    $email : email
};
const sql = 'SELECT * FROM Employee WHERE Employee.email = $email;'
    // find the employee in the DB
    db.get(sql, values, (error, employee) => {
        // employee not existing
        if(!employee) {
            return res.status(401).json({error: 'We cannot find you, sorry'})
        }
        // if employee exists check the password
        bcrypt.compare( req.body.employee.password, employee.password )
        // then if not valid throw an error
            .then( (valid) => {
                if(!valid){
                    return res.status(401).json({error : 'Invalid password'})
                }
                // if valid, send the response to the client with a token
                res.status(200).json({
                    employeeId: employee.id,
                    // generate a token containing the user id and a secret key with the function sign
                    token: jwt.sign(
                        { employeeId : employee.id},
                        'RANDOM_TOKEN_SECRET',
                        // token expires after 24 hours
                        { expiresIn: '24h'}
                    )
                })
            })
            .catch( (error) => { res.status(500).json( { error } )} )

    }); // END DB GET
}); // LOGIN ROUTE

// Signin
employeeRouter.post('/signin', (req, res, next) => {

    bcrypt.hash(req.body.employee.password, 10)
    .then( hash => {
    const   name = req.body.employee.name,
            firstname = req.body.employee.firstname
            email = req.body.employee.email,
            password = hash,
            position = null,
            imageUrl = null;
    if(!name || !firstname || !email || !password) {
        return res.sendStatus(400);
    };

    const sql = 'INSERT INTO Employee (name, first_name, email, password, position, imageUrl)' +
      'VALUES ($name, $firstname, $email, $password, $position, $imageUrl)';
    const values = {
        $name: name,
        $firstname: firstname,
        $email: email,
        $password: password,
        $position: position,
        $imageUrl: imageUrl
    };

    db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
            (error, employee) => {
              res.status(201).json({employee: employee});
            });
        }
      });

    })
    .catch(error => { res.status(500).json({error}) })
    
});


module.exports = employeeRouter;