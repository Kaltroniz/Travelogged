const Campgr=require('../models/campground');
const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Databse connected");
})

const sample=array=>array[Math.floor(Math.random()*array.length)];
const seedDB=async()=>{
    await Campgr.deleteMany({});
    for(let i=0;i<50;i++){
        const rand=Math.floor(Math.random()*100);
        const p=Math.floor(Math.random()*1000)+5000;
        const camp=new Campgr({
            location: `${cities[rand].city},${cities[rand].admin_name}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'lorem',
            price: p
        })
        await camp.save();
    }
}
seedDB().then(()=>{mongoose.connection.close();})