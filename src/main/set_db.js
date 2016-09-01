const path = require('path'),
  Datastore = require('nedb'),
  db = {};
import constants from '../constants';
  db.files = new Datastore({filename: path.resolve(constants.DB_PATH, './files'),
    autoload: true,
    timestampData: true}),
  db.books = new Datastore({filename: path.resolve(constants.DB_PATH, './books'),
    autoload: true,
    timestampData: true}),
  db.tags = new Datastore({filename: path.resolve(constants.DB_PATH, './tags'),
    autoload: true,
    timestampData: true}),
  db.infos = new Datastore({filename: path.resolve(constants.DB_PATH, './infos'),
    autoload: true,
    timestampData: true});

db.books.ensureIndex({ fieldName: 'updatedAt' });
db.files.ensureIndex({ fieldName: 'updatedAt' });
db.files.ensureIndex({ fieldName: 'bookId' });

db.files.ensureIndex({ fieldName: '_id', unique: true }, function (err) {
})

module.exports = db;
