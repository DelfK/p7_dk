const storyRouter = require('express').Router({mergeParams: true});

//DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// multer
const multer = require('../middleware/multer-config');

// auth
const auth = require('../middleware/auth');

//moderate
const moderate = require('../middleware/moderate');

//validate
const validate = require('../middleware/validateStory');

// import express-validator
const { check, validationResult } = require('express-validator');

// import the controllers
const employeeCtrl = require('../controllers/employee');
const storyCtrl = require('../controllers/story');

// import fs
const fs = require('fs');

// GET ALL THE STORIES OF AN EMPLOYEE
storyRouter.get('/', storyCtrl.getAllStories);

// GET ONE STORY
storyRouter.get('/:storyId', storyCtrl.getOneStory);

// CREATE ONE STORY
storyRouter.post('/', [
    check('story.title', 'Titre non valide').optional().matches(/^[a-z0-9\s!]+$/i),
    check('story.content', 'Contenu non valide').optional().matches(/^[a-zA-Z0-9\s.,'-]+$/igm),
   
], auth, validate, multer, storyCtrl.createOneStory);

// UPDATE ONE STORY
storyRouter.put('/:storyId', auth,multer, storyCtrl.updateOneStory);

// DELETE ONE STORY
storyRouter.delete('/:storyId', auth, storyCtrl.deleteOneStory);

// POST ONE SHARE
storyRouter.post('/:storyId/shares', auth, storyCtrl.shareAStory);

// POST ONE COMMENT
storyRouter.post('/:storyId/comments', [
    check('comment.content', 'Contenu non valide').matches(/^[a-z0-9\s.,'-]+$/igm)
], auth, validate, storyCtrl.commentAStory)



module.exports = storyRouter;