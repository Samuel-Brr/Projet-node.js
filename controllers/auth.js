const bcrypt = require('bcryptjs')

const User = require("../models/user")


exports.getLogin = (req, res, next) => {
        res.render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false
        });
  };

  exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false
    });
  };

  // bcrypt.compare retourne une promesse, le bloc "then" ne signifie pas que les mots de passe correspondent 
  // mais juste qu'il n y a pas eu d'erreur dans le processus de vérification
  // le bloc "then" retourne un boolean (doMatch) qui sera false si les mdps ne correspondent pas ou true si ils correspondent

  exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
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
  const confirmPassword = req.body.confirmPassword
  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc){
        return res.redirect('/signup')
      }
      return bcrypt
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
        })
    })
    .catch(err => {
    console.log(err)
  })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err)
    res.redirect('/');
  })
};