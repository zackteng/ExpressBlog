var crypto = require('crypto');
var helper = require('./helper');
var User = require('../models/User');
var Post = require('../models/Post');

module.exports = function (app) {
  app.get('/', function (req, res) {
    Post.get(null, function (err, posts) {
      if(err) {
        posts = [];
      }
      res.render('index', {
        title: '主页',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/reg', helper.checkNotLoign);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册' ,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/reg', helper.checkNotLoign);
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
  app.get('/login', helper.checkNotLoign);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/login', helper.checkNotLoign);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    User.get(req.body.name, function (err, user) {
      if(!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login');
      }
      if(user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登录成功!');
      res.redirect('/');
    });
  });
  app.get('/post', helper.checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/post', helper.checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user,
        post = new Post({ name: currentUser.name,
                          title: req.body.title,
                          content: req.body.content
                        });
    post.save(function (err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');
    });
  });
  app.get('/logout', helper.checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });
};
