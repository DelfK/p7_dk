// DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// path
const path = require('path');

// fs
const fs = require('fs');



// GET ALL THE COMMENTS
exports.getComments = (req, res, next) => {
  const sql = "SELECT DISTINCT Comments.id, Comments.content, Comments.approuve, strftime('%Y-%m-%d %H:%M:%S', Comments.dateCreated) AS dateCreated, " +
  "Comments.employee_id, Employee.imageUrl, Employee.name, Employee.first_name, Stories.title FROM Comments JOIN Stories ON Comments.story_id = stories.id " +
  "JOIN Employee ON Comments.employee_id = Employee.id " +
  "ORDER BY dateCreated DESC";
            
  db.all(sql, (error, comments) => {
    if(error){
      next(error)
    } else if(comments) {
      comments.forEach(element => {
        if(!element.imageUrl){
          element.imageUrl = `${req.protocol}://${req.get('host')}/images/user.png`;
        }
      })
      res.status(200).json(comments);
    } else {
      res.sendStatus(400);
    }
  })
};

// GET ALL THE COMMENTS OF A STORY
exports.getStoryComments = (req, res, next) => {
  const sql = "SELECT DISTINCT Comments.id, Comments.content, Comments.approuve, strftime('%Y-%m-%d %H:%M:%S', Comments.dateCreated) AS dateCreated, " +
  "Comments.employee_id, Employee.imageUrl, Employee.name, Employee.first_name FROM Comments JOIN Stories ON Comments.story_id = $storyId " +
  "JOIN Employee ON Comments.employee_id = Employee.id " +
  "ORDER BY dateCreated DESC"
  const value = {$storyId: `${req.params.storyId}`};
  db.all(sql, value, (error, comments) => {
    if(error){
      next(error)
    } else if(comments) {
      comments.forEach(element => {
        if(!element.imageUrl){
          element.imageUrl = `${req.protocol}://${req.get('host')}/images/user.png`;
        }
      })
      res.status(200).json(comments);
    } else {
      res.sendStatus(400);
    }
  })
};


// GET ALL THE STORIES
exports.getStoriesCount = (req, res, next) => {
  const sql = "SELECT COUNT(*) AS Total FROM Stories";
            
  db.all(sql, (error, stories) => {

    if(error){
      next(error)

    } else if(stories) {
      res.status(200).json(stories);

    } else {
      res.sendStatus(400);
    }
  })
};


// GET ALL THE STORIES
exports.getStories = (req, res, next) => {
  let sql
  if(req.query.limit && req.query.offset) {
    sql = "SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, strftime('%Y-%m-%d %H:%M:%S',Stories.dateCreated) AS dateCreated, Stories.employee_id,  " +
            "Employee.name, Employee.first_name, Employee.deleted FROM Stories JOIN Employee ON Stories.employee_id = Employee.id "+
            "ORDER BY dateCreated DESC LIMIT $offset, $limit";

  } else {
    sql = "SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, strftime('%Y-%m-%d %H:%M:%S',Stories.dateCreated) AS dateCreated, Stories.employee_id,  " +
            "Employee.name, Employee.first_name, Employee.deleted FROM Stories JOIN Employee ON Stories.employee_id = Employee.id "+
            "ORDER BY dateCreated DESC";
  }
  
  const values = {
    $limit : req.query.limit,
    $offset : req.query.offset
  }
            
  db.all(sql, values, (error, stories) => {
    if(error){
      next(error)

    } else if(stories) {

        stories.forEach( element => {
            // display random placeholder image if imageUrl null
            let randomImage = Math.floor(Math.random() * 3);
            if(!element.imageUrl) {
                switch (randomImage) {
                case 0:
                  element.imageUrl = `${req.protocol}://${req.get('host')}/images/random_article_1.jpg`;
                  break;
                case 1:
                  element.imageUrl = `${req.protocol}://${req.get('host')}/images/random_article_2.jpg`;
                  break;
                case 2:
                  element.imageUrl = `${req.protocol}://${req.get('host')}/images/random_article_3.jpg`;
                  break;
                }
                
            }
            if(element.deleted === 1){
            
            element.profileImage = `${req.protocol}://${req.get('host')}/images/user.png`;
            element.name = "Groupomania";
            element.first_name = " ";
        };
            
        }
            
        );
      res.status(200).json(stories);
    } else {
      res.sendStatus(400);
    }
  })
};


// GET ONE EMPLOYEE
exports.getOneEmployee = (req, res, next) => {
    const sql = 'SELECT id, name, first_name, email, position, imageUrl, role, deleted, uuid FROM Employee WHERE Employee.uuid = $employeeId';
    const values = {$employeeId: `${req.params.employeeId}`};

    db.get(sql, values, (error, employee) => {
        if (error) {
            next(error);

          } else if (employee && employee.deleted === 0) {
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

//GET ALL EMPLOYEES
exports.getEmployees = (req, res, next) => {
  const sql = 'SELECT id, name, first_name , imageUrl, deleted FROM Employee WHERE deleted = 0';

  db.all(sql, (error, employees) => {
      if (error) {
          next(error);
        } else if(employees) {
          res.status(200).json({employees: employees})
        } else {
          res.sendStatus(404);
        }

  })

}


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

// GET SHARED STORIES
exports.displaySharedStories = (req, res, next) => {
  const employeeId = req.params.employeeId
  const sql = 'SELECT DISTINCT Stories.id, Stories.title, Stories.imageUrl, Stories.employee_id, Employee.name, Employee.first_name ' +
              'FROM Stories JOIN Shares ON Stories.id = Shares.story_id '+
              'JOIN Employee ON Stories.employee_id = Employee.id ' +
              'WHERE Shares.recipient_id = $employeeId ';
  const values = { $employeeId: employeeId };

  db.all(sql, values, (err, shares) => {
    if(err){
      next(err)
    } else {
      res.status(200).json({shares : shares})
    }
  })

};

// DELETE A COMMENT
exports.deleteComment = (req, res, next) => {
  const sql = 'SELECT * FROM Comments WHERE Comments.id = $commentId';
  const values = { $commentId : req.params.commentId}

  db.get(sql, values, (error, comment) => {
      if(error) {
          next(error)
      } else if (comment) {
      
          db.run(`DELETE FROM Comments WHERE Comments.id = $commentId `, {$commentId : comment.id}, (err) => {
              if(err){
                  next(err)
              } else {
                  res.sendStatus(204);
              }
          });
          
      } else {
          res.sendStatus(400);
      };
  });

};

// REMOVE A COMMENT
exports.removeComment = (req, res, next) => {
  
  const sqlRemove = 'UPDATE Comments SET approuve = $approuve ' +
  'WHERE Comments.id = $commentId'
  const values = {
    $approuve: 0, 
    $commentId : req.params.commentId
  };

  db.run(sqlRemove, values,  (err) => {
      if(err){
          next(err)
      } else {
          db.get('SELECT * FROM Comments WHERE Comments.id = $commentId', { $commentId : req.params.commentId},
          (err, comment) => {
            if(err){
              next(err)
            }else if(comment) {
              res.status(200).json({comment: comment});
            } else {
              res.sendStatus(400);
            }

          });
          
      }
  });
};


// APPROUVE A COMMENT
exports.approuveComment = (req, res, next) => {
  
  const sqlRemove = 'UPDATE Comments SET approuve = $approuve ' +
  'WHERE Comments.id = $commentId'
  const values = {
    $approuve: 1, 
    $commentId : req.params.commentId
  };

  db.run(sqlRemove, values,  (err) => {
      if(err){
          next(err)
      } else {
          db.get('SELECT * FROM Comments WHERE Comments.id = $commentId', { $commentId : req.params.commentId},
          (err, comment) => {
            if(err){
              next(err)
            }else if(comment) {
              res.status(200).json({comment: comment});
            } else {
              res.sendStatus(400);
            }

          });
          
      }
  });
};
