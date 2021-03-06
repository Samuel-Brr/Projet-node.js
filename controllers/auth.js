const bcrypt = require('bcryptjs')
// const nodemailer = require("nodemailer")
// const sendgridTransport = require('nodemailer-sendgrid-transport')

const User = require("../models/user")
const {validationResult} = require('express-validator')

// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth:{
//     api_key:"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",
//   }
// }))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if(message.length>0){
    message = message[0]
  }else{
    message = null
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if(message.length>0){
    message = message[0]
  }else{
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

  // bcrypt.compare retourne une promesse, le bloc "then" ne signifie pas que les mots de passe correspondent 
  // mais juste qu'il n y a pas eu d'erreur dans le processus de vérification
  // le bloc "then" retourne un boolean (doMatch) qui sera false si les mdps ne correspondent pas ou true si ils correspondent

  exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req)

    if(!errors.isEmpty()){
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg
      });
    }

    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          req.flash('error', 'invalid email or password')
          return res.redirect('/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            req.flash('error', 'invalid email or password')
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
  };

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render(res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    }))
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email:email,
        password:hashedPassword,
        cart: { items: [] }
      })
      return user.save()
    })
    .then(result=>{
      res.redirect('/login')
      // transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded !',
      //   html: '<h1>You successfully signed up !</h1>'
      // })
    })
    .catch(err=>{
      console.log(err)
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err)
    res.redirect('/');
  })
};