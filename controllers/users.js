const User =require('../models/user')


module.exports.userindex=(req,res)=>{
    res.render('users/register');
}

module.exports.registeruser=async(req,res,next)=>{
    try {
        const {email,username,password} = req.body;
        const user=new User({email,username});
        const regus=await User.register(user,password);
        req.login(regus,err=>{
            if(err) return next(err);
            req.flash('success','Welcome to Camp');//change name
            res.redirect('/campgrounds');
        })
        
    } catch (error) {
        req.flash('error',error.message);
        res.redirect('/register');
    }
    
}

module.exports.loginuser=(req,res)=>{
    req.flash('success','welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}


module.exports.logoutuser=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}


module.exports.showlogin=(req,res)=>{
    
    res.render('users/login');
}