const employeeRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');


// import bcrypt
const bcrypt = require('bcrypt');

// Login
employeeRouter.get('/login', (req, res, next) => {
res.send('Login')
});

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