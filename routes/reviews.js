const express=require('express');
const router=express.Router({mergeParams:true});


const Campgr=require('../models/campground');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const { isLoggedIn, isReviewAuthor } = require('../middlewre.js');
const { createrev, deleterev } = require('../controllers/reviews.js');
const isAuthor=async(req,res,next)=>{
      const {id}=req.params;
    const c1=await Campgr.findById(id);
    if(!c1.author,equals(req.user._id)){
        req.flash('error','No permission');
        return res.redirect(`/campgrounds/${c1._id}`);
    }
    next();
}
const reviewvalidation=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

router.post('/',isLoggedIn,reviewvalidation,catchAsync(createrev))

router.delete('/:reviewid',isLoggedIn,isReviewAuthor, catchAsync(deleterev))


module.exports=router;