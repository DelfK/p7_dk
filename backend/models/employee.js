const Sequelize = require('sequelize');
const db = require('../config/database');

const Employee = db.define('employee', {
    name: {
        type: Sequelize.STRING
    },
    firstname: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    position: {
        type: Sequelize.STRING
    },
    imageUrl: {
        type: Sequelize.STRING
    },
});

module.exports = Employee;