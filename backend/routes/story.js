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
const storyCtrl = require('../controllers/story');

// import fs
const fs = require('fs');

// GET ALL THE STORIES OF AN EMPLOYEE
storyRouter.get('/', storyCtrl.getAllStories);

// GET ONE STORY
storyRouter.get('/:storyId', storyCtrl.getOneStory);

// CREATE ONE STORY
storyRouter.post('/', multer, storyCtrl.createOneStory);

// UPDATE ONE STORY
storyRouter.put('/:storyId', multer, storyCtrl.updateOneStory);

// DELETE ONE STORY
storyRouter.delete('/:storyId', storyCtrl.deleteOneStory);

// POST ONE SHARE
storyRouter.post('/:storyId/shares', storyCtrl.shareAStory)

module.exports = storyRouter;