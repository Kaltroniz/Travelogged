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
const flash=require('connect-flash');
const session=require('express-session');
const { title } = require('process');
const Review = require('./models/review');
const { reviewSchema } = require('./schemas.js');
const campgrounds=require('./routes/campground.js');
const reviews=require('./routes/reviews.js')
const userRoutes=require('./routes/user.js')
const passport=require('passport')
const LocalStrategy=require('passport-local');
const User=require('./models/user.js')


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
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig={
    secret: 't',
    resave: false,
    saveUninitialised:true,
    Cookie:{
        httpOnly: true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.get('/',(req,res)=>{
    res.render('home')
})

app.use('/',userRoutes)
app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)




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