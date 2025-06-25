const express=require('express');
const router=express.Router();
const{isLoggedIn}=require('../middlewre');
const Campgr=require('../models/campground');



const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Joi = require('joi');


const { reviewSchema } = require('../schemas');
const { index, newform, createcamp, edit, showcamp, updatecamp, edit1 } = require('../controllers/campground');



router.get('/new',isLoggedIn,newform)

const validation=(req,res,next)=>{
 const schema=Joi.object({
        campground: Joi.object({
            title:Joi.string().required(),
            price:Joi.number().required().min(0),
            location:Joi.string().required(),
            image: Joi.string().required(),
            description:Joi.string().required()
        }).required()
    })
    const {error}=schema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
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
const isAuthor=async(req,res,next)=>{
      const {id}=req.params;
      
    const c1=await Campgr.findById(id).populate({
        path:'reviews',
    populate:{path:'author'}}).populate('author');;
    
    if(!c1.author.equals(req.user._id)){
        req.flash('error','No permission');
        return res.redirect(`/campgrounds/${c1._id}`);
    }
    next();
}
router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn,validation,catchAsync( createcamp))


router.get('/:id',catchAsync(async (req,res)=>{
    const cg1=await Campgr.findById(req.params.id)
    if(!cg1){
        req.flash('error','cannot find campground');
        return res.redirect('/campgrounds')
    }
    const cg=await Campgr.findById(req.params.id).populate({
        path:'reviews',
    populate:{path:'author'}}).populate('author');
  
    if(!cg){
        req.flash('error','cannot find campground');
        return res.redirect('/campgrounds')
    }
    
    
    return res.render('campgrounds/show',{cg});
}))


router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(edit1))

router.put('/:id', isLoggedIn,isAuthor,validation,catchAsync(updatecamp))

router.delete('/:id',isLoggedIn,catchAsync(async (req,res)=>{
    const {id}= req.params;
    await Campgr.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

module.exports=router;
