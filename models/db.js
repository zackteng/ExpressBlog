var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var url = "mongodb://localhost:27071/blog";


module.exports = function (callback) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    callback(db);
    db.close();
  });
};