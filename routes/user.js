const express=require('express');
const router=express.Router();
const { storeReturnTo } = require('../middlewre');
const User =require('../models/user')
const catchAsync= require('../utils/catchAsync');
const passport = require('passport');
const { userindex, registeruser, loginuser, logoutuser, showlogin } = require('../controllers/users');


router.get('/register',userindex)

router.post('/register', catchAsync(registeruser));

router.get('/login',showlogin)

router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),loginuser)

router.get('/logout', logoutuser); 

module.exports=router;