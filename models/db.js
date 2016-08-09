var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var url = "mongodb://127.0.0.1:27017/blog";

module.exports = function connectDb(callback) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    callback(db);
    db.close();
  });
};
