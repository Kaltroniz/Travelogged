require('dotenv').config();
const Campgr=require('../models/campground');


const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index=async (req,res)=>{
    const cg=await Campgr.find({});
    res.render('campgrounds/index',{campgrounds:cg});
}

module.exports.newform=(req,res)=>{
    
    res.render('campgrounds/new');
}

module.exports.createcamp=async (req,res)=>
{   
    console.log(process.env.MAPTILER_API_KEY)
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const c = new Campgr(req.body.campground);
    c.geometry = geoData.features[0].geometry;
    
    c.author=req.user._id;
    
    console.log(c);
    await c.save();
    req.flash('success','successfully added campground');
    res.redirect(`/campgrounds/${c._id}`,)
}

module.exports.showcamp=async (req,res)=>{
    const cg=await Campgr.findById(req.params.id).populate({
        path:'reviews',
    populate:{path:'author'}}).populate('author');
    
    if(!cg){
        req.flash('error','cannot find campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{cg});
}

module.exports.edit1=async (req,res)=>{
    
    const cg=await Campgr.findById(req.params.id);
    if(!cg){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campground');
    }
   
    
     res.render('campgrounds/edit',{cg});
}

module.exports.updatecamp=async (req,res)=>{
    const {id}=req.params;
   
   const c= await Campgr.findByIdAndUpdate(id,{...req.body.campground});
   const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    c.geometry = geoData.features[0].geometry;
   req.flash('success','successfully updated campground');
    res.redirect(`/campgrounds/${c._id}`)
}