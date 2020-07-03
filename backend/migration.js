const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// create the DB tables
db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS `Employee` ( ' +
             '`id` INTEGER PRIMARY KEY AUTOINCREMENT, ' +
             '`name` TEXT NOT NULL, ' +
             '`first_name` TEXT NOT NULL, ' +
             '`email` TEXT NOT NULL UNIQUE, ' +
             '`password` TEXT NOT NULL, ' +
             '`position` TEXT, ' +
             '`imageUrl` TEXT, ' +
             '`deleted` BOOLEAN DEFAULT false )'
        )
  });