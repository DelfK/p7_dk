// DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// path
const path = require('path');

// fs
const fs = require('fs');

// GET EMPLOYEE
exports.getOneEmployee = (req, res, next) => {
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


};


// UPDATE EMPLOYEE
exports.updateOneEmployee = (req, res, next) => {
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


};

// DELETE EMPLOYEE
exports.deleteOneEmployee = (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const values = {$employeeId: `${req.params.employeeId}`};

  db.get(sql, values, (error, employee) => {
      if (error) {
          next(error);
        } else if(employee) {

          const folderToRemove = employee.id + '_' + employee.name + employee.first_name;

          // Remove the employee folder and its content
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
              console.log("Directory path not found.");
              
              
            }
          }
          const pathToDir = path.join('images', folderToRemove)
          removeDir(pathToDir);
          

          // Update the DB to pass true to deleted for the employee
          db.run('UPDATE Employee SET deleted = $deleted ' +
          'WHERE Employee.id = $employeeId', {
              $deleted : true,
              $employeeId : employee.id
          }, (err) => {
              if(err){
                  next(err)
              } else {
                  res.sendStatus(200);
              }
          });

        } else {
          res.sendStatus(400);
        }

  })




};