const path = require('path'),
  Datastore = require('nedb'),
  db = {};
  db.files = new Datastore({filename: path.resolve(__dirname, '../../db/files'),
    autoload: true,
    timestampData: true}),
  db.books = new Datastore({filename: path.resolve(__dirname, '../../db/books'),
    autoload: true,
    timestampData: true}),
  db.tags = new Datastore({filename: path.resolve(__dirname, '../../db/tags'),
    autoload: true,
    timestampData: true}),
  db.infos = new Datastore({filename: path.resolve(__dirname, '../../db/infos'),
    autoload: true,
    timestampData: true});

db.books.ensureIndex({ fieldName: 'updatedAt' });
db.files.ensureIndex({ fieldName: 'updatedAt' });

module.exports = db;
