var connectDb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

User.create = function () {

}

User.prototype.save = function (callback) {
  var user = {
    name: this.name,
    password: this.password,
    email: this.email
  };
  connectDb(function (db) {
    db.collection("users", function (err, collection) {
      if(err) {
        return callback(err);
      }
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        if(err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });
  });
};

User.get = function (name, callback) {
  connectDb(function (db) {
    db.collection("users", function (err, collection) {
      if(err) {
        callback(err);
      }
      collection.findOne({
        name: name
      }, function (err, user) {
        if(err) {
          callback(err);
        }
        callback(null, user);
      });
    });
  });
};

module.exports = User;
