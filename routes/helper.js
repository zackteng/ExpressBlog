module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    if(!req.session.user) {
      req.flash('error', '未登录');
      res.redirect('/login');
    }
    next();
  },
  checkNotLoign: function checkNotLoign(req, res, next) {
    if(req.session.user) {
      req.flash('error', '已登录');
      res.redirect('back');
    }
    next();
  }
};
