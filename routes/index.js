var crypto = require('crypto');
var User = require('../models/User');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', { title: '主页' });
  });
  app.get('/reg', function (req, res) {
    res.render('reg', { title: '注册' });
  });
  app.post('/reg', function (req, res) {
    var name = req.body['name'],
        password = req.body['password'],
        password_re = req.body['password-repeat'];

    if(password !== password_re) {
      req.flash('error', '两次输入的密码不一致');
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        passwordMD5 = md5.update(password).digest('hex');
    var newUser = new User({
      name: name,
      password: passwordMD5,
      email: req.body['email']
    });
    User.get(name, function (err, user) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if(user) {
        req.flash('error', '用户已存在!')
        return res.redirect('/reg');
      }
      newUser.save(function (err, user) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });
    });
  });
  app.get('/login', function (req, res) {
    res.render('login', { title: '登录' });
  });
  app.post('/login', function (req, res) {

  });
  app.get('/post', function (req, res) {
    res.render('post', { title: '发表' });
  });
  app.post('/post', function (req, res) {

  });
  app.get('/logout', function (req, res) {

  });
};
