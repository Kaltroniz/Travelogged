const express=require('express');
const app =express();
const path=require('path');
const ejsMate=require('ejs-mate');
const Campgr=require('./models/campground');
const mongoose = require('mongoose');
const methodoverride= require('method-override');
const campground = require('./models/campground');
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

app.get('/campgrounds',async (req,res)=>{
    const cg=await Campgr.find({});
    res.render('campgrounds/index',{campgrounds:cg});
})
app.get('/campgrounds/new',(req,res)=>{
    
    res.render('campgrounds/new');
})
app.post('/campgrounds',async (req,res)=>
{
    const c=new Campgr(req.body.campground);
    console.log(c);
    await c.save();
    res.redirect(`/campgrounds/${c._id}`)
})

app.get('/campgrounds/:id',async (req,res)=>{
    const cg=await Campgr.findById(req.params.id);
    res.render('campgrounds/show',{cg});
})

app.get('/campgrounds/:id/edit',async (req,res)=>{
    const cg=await Campgr.findById(req.params.id);
    res.render('campgrounds/edit',{cg});
})

app.put('/campgrounds/:id', async (req,res)=>{
    const {id}=req.params;
   const c= await Campgr.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${c._id}`)
})

app.get('/makecampground',async (req,res)=>{
    const camp=new Campgr({title:'My garden'});
    await camp.save();
    res.send(camp);
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
})