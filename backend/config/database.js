const {Sequelize} = require('sequelize');

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './gpDatabase.db'
  });

// test DB connection
db.authenticate()
.then( () => {
    console.log('Connection has been established successfully');
})
.catch( error => {
    console.error('Unable to connect to the database:', error);
});

module.exports = db;