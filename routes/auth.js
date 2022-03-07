const express = require('express');
const {check} = require('express-validator/check')

const authController = require('../controllers/auth')

const router = express.Router();

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin)

router.post('/signup', 
    check('email').isEmail().withMessage("please entera valid email"),
    body('password','plz enter a pswrd with at least 5 alphanumeric char').isLength({min:5}).isAlphanumeric(), 
    authController.postSignup);

router.post('/logout', authController.postLogout)

module.exports = router