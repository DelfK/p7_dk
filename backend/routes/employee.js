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

// fs
const fs = require('fs');

// path
const path = require('path');



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
employeeRouter.get('/:employeeId', (req, res, next) => {
    const sql = 'SELECT id, name, first_name, email, position, imageUrl FROM Employee WHERE Employee.id = $employeeId';
    const values = {$employeeId: `${req.params.employeeId}`};

    db.get(sql, values, (error, employee) => {
        if (error) {
            next(error);
          } else if(employee) {
            const image = employee.imageUrl;
            // send a placeholder for the profile image if none has been uploaded by the employee
            if(image === null) {
                employee.imageUrl = `${req.protocol}://${req.get('host')}/images/user.png`
            }
            res.status(200).json(employee)

          } else {
            res.sendStatus(404);
          }

    })


});

// UPDATE ONE EMPLOYEE
employeeRouter.put('/:employeeId', multer, (req, res, next) => {
            const newEmployee = req.file ? {
                //if yes send the new url with the new filename
                ...JSON.parse(JSON.stringify(req.body)),
                // req.body = [Object: null prototype] { } => see : https://www.thetopsites.net/article/58109971.shtml
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        
                // if not send the body only
            } : {...req.body.employee};

  
        const name = newEmployee.name;
        const firstname = newEmployee.firstname;
        const email = newEmployee.email;
        const position = newEmployee.position;
        const imageUrl = newEmployee.imageUrl;

            const inSql = 'UPDATE Employee SET name = $name, first_name = $firstname, ' +
            'email = $email, position = $position, imageUrl = $imageUrl ' +
            'WHERE Employee.id = $employeeId';
            const inValues = {
            $name: name,
            $firstname: firstname,
            $email: email,
            $position: position,
            $imageUrl: imageUrl,
            $employeeId: req.params.employeeId
            };

            db.run(inSql, inValues, (error) => {
                if (error) {
                  next(error);
                } else {
                  db.get(`SELECT name, first_name, email, position, imageUrl FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
                    (error, employee) => {
                      res.status(200).json(employee);
                    });
                }
            });
});


// DELETE ONE EMPLOYEE
employeeRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: `${req.params.employeeId}`};

  db.get(sql, values, (error, employee) => {
      if (error) {
          next(error);
        } else if(employee) {

          const fileToRemove = employee.name + employee.first_name;

          // Remove the employee folder
          const removeDir = (path) => {
            if (fs.existsSync(path)) {
              const files = fs.readdirSync(path)
          
              if (files.length > 0) {
                files.forEach(function(filename) {
                  if (fs.statSync(path + "/" + filename).isDirectory()) {
                    removeDir(path + "/" + filename)
                  } else {
                    fs.unlinkSync(path + "/" + filename)
                  }
                })
                fs.rmdirSync(path)
              } else {
                fs.rmdirSync(path)
              }
            } else {
              console.log("Directory path not found.")
            }
          }
          const pathToDir = path.join('images', fileToRemove)
          removeDir(pathToDir);

          // Update the DB to pass true to deleted for the employee

          

        } else {
          res.sendStatus(400);
        }

  })


});




module.exports = employeeRouter;