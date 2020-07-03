const storyRouter = require('express').Router({mergeParams: true});

//DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// import express-validator
const { check, validationResult } = require('express-validator');

// multer
const multer = require('../middleware/multer-config');

// auth
const auth = require('../middleware/auth');

// import the controllers
const employeeCtrl = require('../controllers/employee');


// CREATE ONE STORY
storyRouter.post('/', multer, (req, res, next) => {

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
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
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

    });

    


module.exports = storyRouter;