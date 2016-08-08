function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

User.prototype.save = function(callback) {

};

module.exports = User;