// DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// fs
const fs = require('fs');


// GET ALL THE STORIES OF AN EMPLOYEE
exports.getAllStories = (req, res, next) => {
    const sql = 'SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, Stories.employee_id, Employee.name, Employee.first_name ' +
    'FROM Stories JOIN Employee ON Stories.employee_id = Employee.id '+
    'WHERE Stories.employee_id = $employeeId ';

    const value = { $employeeId : req.params.employeeId }
    
    db.all(sql, value, (error, stories) => {
    if(error){
    next(error)
    } else if(stories) {
    res.status(200).json(stories);
    } else {
    res.sendStatus(400);
    }
    });
};


// GET ONE STORY
exports.getOneStory = (req, res, next) => {
    const sql = 'SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, Stories.employee_id, Employee.name, Employee.first_name ' +
                'FROM Stories JOIN Employee ON Stories.employee_id = Employee.id '+
                'WHERE Stories.id = $storyId ';
   
    const value = { $storyId : req.params.storyId }
              
    db.get(sql, value, (error, story) => {
      if(error){
        next(error)
      } else if(story) {
        res.status(200).json(story);
      } else {
        res.sendStatus(400);
      }
    })
};


// CREATE ONE STORY
exports.createOneStory = (req, res, next) => {
    const newStory = req.file ? {
        //if yes send the new url with the new filename
        ...JSON.parse(JSON.stringify(req.body)),
        // req.body = [Object: null prototype] { } => see : https://www.thetopsites.net/article/58109971.shtml
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

        // if not send the body only
    } : {...req.body.story};

    const title = newStory.title;
    const content = newStory.content; 
    const imageUrl = newStory.imageUrl;
    const employeeId = req.params.employeeId;

    //date
    const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const date = new Date();
    const dateCreated = date.getUTCDate() + ' ' + monthNames[date.getMonth()] + ' ' +  date.getFullYear();

    const sql = 'INSERT INTO Stories (title, content, imageUrl, dateCreated, employee_id)' +
    'VALUES ($title, $content, $imageUrl, $dateCreated, $employeeId)';
    const values = {
        $title : title,
        $content: content,
        $imageUrl: imageUrl,
        $dateCreated : dateCreated,
        $employeeId: employeeId
    };

    db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT id, title, content, imageUrl, dateCreated, employee_id FROM Stories WHERE Stories.id = ${this.lastID}`,
            (error, story) => {
              res.status(201).json(story);
            });
        }
      });
}

//UPDATE ONE STORY
exports.updateOneStory = (req, res, next) => {
    const newStory = req.file ? {
        //if yes send the new url with the new filename
        ...JSON.parse(JSON.stringify(req.body)),
        // req.body = [Object: null prototype] { } => see : https://www.thetopsites.net/article/58109971.shtml
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

        // if not send the body only
    } : {...req.body.story};

    const title = newStory.title;
    const content = newStory.content; 
    const imageUrl = newStory.imageUrl;
    const storyId = req.params.storyId;

    const sql = 'UPDATE Stories SET title = $title, content = $content, ' +
    'imageUrl = $imageUrl ' +
    'WHERE Stories.id = $storyId';
    const values = {
        $title : title,
        $content: content,
        $imageUrl: imageUrl,
        $storyId: storyId
    };

    db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT id, title, content, imageUrl, dateCreated, employee_id FROM Stories WHERE Stories.id = ${req.params.storyId}`,
            (error, story) => {
              res.status(201).json(story);
            });
        }
      });

};

// DELETE ONE STORY
exports.deleteOneStory = (req, res, next) => {
    const sql = 'SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, Stories.employee_id, Employee.name, Employee.first_name FROM Stories LEFT JOIN Employee ON Stories.employee_id = Employee.id WHERE Stories.id = $storyId';
    const values = { $storyId : req.params.storyId };

    db.get(sql, values, (error, story) => {
        if(error) {
            next(error)
        } else if (story) {
            if(story.imageUrl){
                const filename = story.imageUrl.split('/images/')[1];
                fs.unlink(`images/${story.employee_id}_${story.name}${story.first_name}/` + filename, () => {});
            };
            
            db.run(`DELETE FROM Stories WHERE Stories.id = $storyId `, {$storyId : story.id}, (err) => {
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