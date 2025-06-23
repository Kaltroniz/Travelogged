
const Campgr=require('../models/campground');
const Review = require('../models/review');


module.exports.createrev=async (req,res)=>{
    const c=await Campgr.findById(req.params.id);
    const rev=new Review(req.body.review);
    c.reviews.push(rev);
    rev.author=req.user._id
    await rev.save();
    await c.save();
    res.redirect(`/campgrounds/${c._id}`);
}
module.exports.deleterev=async (req,res)=>{
    const {id,reviewid}=req.params;
    await Campgr.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`);
}