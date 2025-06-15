const express=require('express');
const app =express();
const path=require('path');
const ejsMate=require('ejs-mate');
const Campgr=require('./models/campground');
const mongoose = require('mongoose');
const methodoverride= require('method-override');
const campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { title } = require('process');
const Review = require('./models/review');
const { reviewSchema } = require('./schemas');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Databse connected");
})

app.engine('ejs',ejsMate)

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method'));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',catchAsync(async (req,res)=>{
    const cg=await Campgr.find({});
    res.render('campgrounds/index',{campgrounds:cg});
}))
app.get('/campgrounds/new',(req,res)=>{
    
    res.render('campgrounds/new');
})
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
app.post('/campgrounds',validation,catchAsync( async (req,res)=>
{   
    
    const c=new Campgr(req.body.campground);
    console.log(c);
    await c.save();
    res.redirect(`/campgrounds/${c._id}`)
}))

app.get('/campgrounds/:id',catchAsync(async (req,res)=>{
    const cg=await Campgr.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{cg});
}))

app.post('/campgrounds/:id/reviews',reviewvalidation,catchAsync(async (req,res)=>{
    const c=await Campgr.findById(req.params.id);
    const rev=new Review(req.body.review);
    c.reviews.push(rev);
    await rev.save();
    await c.save();
    res.redirect(`/campgrounds/${c._id}`);
}))

app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
    const cg=await Campgr.findById(req.params.id);
    res.render('campgrounds/edit',{cg});
}))

app.put('/campgrounds/:id', validation,catchAsync(async (req,res)=>{
    const {id}=req.params;
   const c= await Campgr.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${c._id}`)
}))

app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
    const {id}= req.params;
    await Campgr.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:id/reviews/:reviewid', catchAsync(async (req,res)=>{
    const {id,reviewid}=req.params;
    await Campgr.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`);
}))

app.get('/makecampground',catchAsync(async (req,res)=>{
    const camp=new Campgr({title:'My garden'});
    await camp.save();
    res.send(camp);
}))

app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req,res,next)=>{
 const {statusCode=500,message='something went wrong'}=err;
 res.status(statusCode).render('error',{message,statusCode});
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
})