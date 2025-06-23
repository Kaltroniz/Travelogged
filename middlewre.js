const review = require("./models/review");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','you must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
      const {id,reviewid}=req.params;
    const r1=await review.findById(reviewid);
    if(!r1.author,equals(req.user._id)){
        req.flash('error','No permission');
        return res.redirect(`/campgrounds/${c1._id}`);
    }
    next();
}