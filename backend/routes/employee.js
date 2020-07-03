const employeeRouter = require('express').Router();

//DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// import jsonwebtoken
const jwt = require('jsonwebtoken');

// import bcrypt
const bcrypt = require('bcrypt');

// import express-validator
const { check, validationResult } = require('express-validator');

// multer
const multer = require('../middleware/multer-config');


// import the controllers
const employeeCtrl = require('../controllers/employee');



// LOGIN
employeeRouter.post('/login', [
    check('email', 'Your email is not valid').not().isEmpty().normalizeEmail(),
    check('password', 'Your password must be at least 8 characters').not().isEmpty().isLength({min: 8})
], (req, res, next) => {
//const errors = validationResult(req);

const email = req.body.employee.email;
const values = {
    $email : email
};

//if (!errors.isEmpty()) {
    //return res.status(422).json(errors.array());
  //} else {
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
  //} END CHECK VALIDITY ENDPUT
 

}); // END LOGIN ROUTE

// SIGNIN
employeeRouter.post('/signin', [
    check('name').exists().isLength({min: 4}).trim().escape().withMessage('Name must have more than 4 characters'),
    check('firstname').exists().isLength({min: 4}).trim().escape().withMessage('Name must have more than 4 characters'),
    check('email', 'Your email is not valid').not().isEmpty().normalizeEmail(),
    check('password', 'Your password must be at least 8 characters').not().isEmpty().isLength({min: 8})
], (req, res, next) => {

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
          db.get(`SELECT id, name, first_name, email, position, imageUrl FROM Employee WHERE Employee.id = ${this.lastID}`,
            (error, employee) => {
              res.status(201).json(employee);
            });
        }
      });

    })
    .catch(error => { res.status(500).json({error}) })
    
});// END SIGNIN ROUTE




// DISPLAY ONE EMPLOYEE
employeeRouter.get('/:employeeId', employeeCtrl.getOneEmployee);


// UPDATE ONE EMPLOYEE
employeeRouter.put('/:employeeId', multer, employeeCtrl.updateOneEmployee);


// DELETE ONE EMPLOYEE
employeeRouter.delete('/:employeeId', employeeCtrl.deleteOneEmployee);



module.exports = employeeRouter;