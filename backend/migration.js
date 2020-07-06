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
        '`deleted` BOOLEAN DEFAULT 0 )');

    db.run('CREATE TABLE IF NOT EXISTS `Stories` ( ' +
    '`id` INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    '`title` TEXT NOT NULL, ' +
    '`content` TEXT NOT NULL, ' +
    '`imageUrl` TEXT, ' +
    '`dateCreated` INTEGER NOT NULL, ' +
    '`employee_id` INTEGER NOT NULL, ' +
    'FOREIGN KEY(`employee_id`) REFERENCES `Employee`(`id`) )');

    db.run('CREATE TABLE IF NOT EXISTS `Shares` ( ' +
    '`id` INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    '`story_id` INTEGER NOT NULL, ' +
    '`recipient_id` INTEGER NOT NULL, ' +
    'FOREIGN KEY(`story_id`) REFERENCES `Stories`(`id`) ' +
    'FOREIGN KEY(`recipient_id`) REFERENCES `Employee`(`id`) )');
});