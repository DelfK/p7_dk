// DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// import express-validator
const { check, validationResult } = require('express-validator');


// prevent user to insert special characters in the create article form
module.exports = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }  else {
        next()  
       } 
};