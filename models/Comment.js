var connectDb = require('./db');

function Comment(name, title, comment) {
  this.name = name;
  this.title = title;
  this.comment = comment;
}

Comment.prototype.save = function (callback) {
  var that = this;
  connectDb(function (db) {
    db.collection('posts', function (err, collection) {
      if (err) {
        return callback(err);
      }
      collection.update({
        name: that.name,
        title: that.title
      }, {
        $push: {"comments": that.comment}
      }, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

module.exports = Comment;
