// DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// fs
const fs = require('fs');


// GET ALL THE STORIES OF AN EMPLOYEE
exports.getAllStories = (req, res, next) => {
    const sql = 'SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, Stories.employee_id, Employee.name, Employee.first_name, Employee.imageUrl AS profileImage, Employee.deleted ' +
    'FROM Stories JOIN Employee ON Stories.employee_id = Employee.id '+
    'WHERE Stories.employee_id = $employeeId ';

    const value = { $employeeId : req.params.employeeId }
    
    db.all(sql, value, (error, stories) => {
    if(error){
    next(error)
    } else if(stories) {
        // If deleted send placeholders as employee name, profile image and story image
        stories.forEach(story => {
            if (story.deleted === 1) {
                story.imageUrl = `${req.protocol}://${req.get('host')}/images/story.jpg`;
                story.profileImage = `${req.protocol}://${req.get('host')}/images/user.png`;
                story.name = "Groupomania";
                story.first_name = " ";
            }
        });
    res.status(200).json(stories);
    
    } else {
    res.sendStatus(400);
    }
    });
};


// GET ONE STORY
exports.getOneStory = (req, res, next) => {
    const sql = "SELECT Stories.id, Stories.title, Stories.content, Stories.imageUrl, strftime('%Y-%m-%d',Stories.dateCreated) AS dateCreated, Stories.employee_id, Employee.name, Employee.first_name, Employee.imageUrl AS profileImage, Employee.deleted " +
                "FROM Stories JOIN Employee ON Stories.employee_id = Employee.id "+
                "WHERE Stories.id = $storyId ";
   
    const value = { $storyId : req.params.storyId }
              
    db.get(sql, value, (error, story) => {
      if(error){
        next(error)
      } else if(story) {
        // If deleted send placeholders as employee name, profile image and story image
        if(story.deleted === 1){
            story.imageUrl = `${req.protocol}://${req.get('host')}/images/story.jpg`;
            story.profileImage = `${req.protocol}://${req.get('host')}/images/user.png`;
            story.name = "Groupomania";
            story.first_name = " ";
        };
        if(!story.profileImage){
            story.profileImage = `${req.protocol}://${req.get('host')}/images/user.png`;
        }

        if(!story.imageUrl){
            story.imageUrl = `${req.protocol}://${req.get('host')}/images/story.jpg`;
        }
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


    const sql = "INSERT INTO Stories (title, content, imageUrl, dateCreated, employee_id)" +
    "VALUES ($title, $content, $imageUrl, datetime('now'), $employeeId)";
    const values = {
        $title : title,
        $content: content,
        $imageUrl: imageUrl,
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

// POST ONE SHARE
exports.shareAStory = (req, res, next) => {
    db.run('INSERT INTO Shares (story_id, recipient_id)' +
    'VALUES ($storyId, $recipientId)',
    {
        $recipientId : req.body.share.recipientId,
        $storyId: req.params.storyId
    }, function(err) {
        if(err){
            next(err)
        } else {
            
            db.get(`SELECT * FROM Shares WHERE Shares.id = ${this.lastID}`, (error, share) => {
                if(err){
                    next(err)
                } else if(share){
                    res.status(201).json({share: share})
                } else {
                    res.sendStatus(400);  
                }
            })
        }
    
    });

};

// COMMENT A STORY
exports.commentAStory = (req, res, next) =>{
    db.run('INSERT INTO Comments (content, story_id, employee_id)' +
    'VALUES ($content, $storyId, $employeeId)',
    {
        $content : req.body.comment.content,
        $storyId: req.params.storyId,
        $employeeId: req.body.comment.employeeId
    }, function(err) {
        if(err){
            next(err)
        } else {
            db.get(`SELECT * FROM Comments WHERE Comments.id = ${this.lastID}`, (error, comment) => {
                if(err){
                    next(err)
                } else if(comment){
                    res.status(201).json({comment: comment})
                } else {
                    res.sendStatus(400);  
                }
            })
        }
    
    });

};



