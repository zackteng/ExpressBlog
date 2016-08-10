var connectDb = require('./db');

function Post(post) {
  this.name = post.name;
  this.title = post.title;
  this.content = post.content;
}

Post.prototype.save = function (callback) {
  var post = {
    name: this.name,
    title: this.title,
    content: this.content,
    time: new Date()
  };
  connectDb(function (db) {
    db.collection("posts", function (err, collection) {
      if(err) {
        return callback(err);
      }
      collection.insert(post, {
        safe: true
      }, function (err, post) {
        if(err) {
          return callback(err);
        }
        callback(null, post[0]);
      });
    });
  });
};

Post.get = function (name, callback) {
  connectDb(function (db) {
    db.collection("posts", function (err, collection) {
      if(err) {
        callback(err);
      }
      var query = {};
      if(name) {
        query.name = name;
      }
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, posts) {
        if(err) {
          callback(err);
        }
        callback(null, posts);
      });
    });
  });
};

module.exports = Post;
