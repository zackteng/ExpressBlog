var crypto = require('crypto');
var helper = require('./helper');
var User = require('../models/User');
var Post = require('../models/Post');
var Comment = require('../models/Comment');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: storage
});

module.exports = function (app) {
  app.get('/', function (req, res) {
    Post.getAll(null, function (err, posts) {
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
  app.get('/upload', helper.checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/upload', helper.checkLogin);
  app.post('/upload', upload.array('field1', 5), function (req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });
  app.get('/u/:name', function (req, res) {
    User.get(req.params.name, function (err, user) {
      if(!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/');
      }
      Post.getAll(user.name, function (err, posts) {
        if(err) {
          req.flash('error', 'err');
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
          user: req.session.user,
          error: req.flash('error').toString(),
          success: req.flash('success').toString()
        });
      });
    });
  });
  app.get('/u/:name/:title', function (req, res) {
    Post.getOne(req.params.name, req.params.title, function (err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: post.title,
        post: post,
        user: req.session.user,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
      });
    });
  });
  app.post('/u/:name/:title', function (req,res) {
    var comment = {
      name: req.body.name,
      email: req.body.email,
      website: req.body.website,
      time: new Date(),
      content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.title, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  });
  app.get('/edit/:name/:title', helper.checkLogin);
  app.get('/edit/:name/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(req.params.name, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
      });
    });
  });
  app.post('/edit/:name/:title', helper.checkLogin);
  app.post('/edit/:name/:title', function (req, res) {
    var currentUser = req.session.user;
    var url = encodeURI("/u/" + req.params.name + "/" + req.params.title);
    Post.update(req.params.name, req.params.title, req.body.content, function (err) {
      if (err) {
        req.flash('err', err);
        return res.redirect(url);
      }
      req.flash('success', '修改成功!');
      res.redirect(url);
    });
  });
  app.get('/remove/:name/:title', helper.checkLogin);
  app.get('/remove/:name/:title', function (req, res) {
    var currentUser = req.session.user;
    // var url = encodeURI("/u/" + req.params.name + "/" + req.params.title);
    Post.remove(req.params.name, req.params.title, function (err) {
      if (err) {
        req.flash('err', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });
};
