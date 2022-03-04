const express = require('express');

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)
const csrf = require("csurf")

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = "mongodb+srv://Sml-Brr:YVmG4mNq24wxbku2@cluster0.jt4fy.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false })); // Permet d'avoir accés au body de la requete via l 'url
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret', 
  resave: false, 
  saveUninitialized: false, 
  store: store}))

app.use(csrfProtection)

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URI,{ useNewUrlParser: true,
    useUnifiedTopology: true }, 
  )
  .then(result => {
    app.listen(3000, ()=>{
      console.log("listening on port 3000...")
    });
    console.log("connected to database !")
  })
  .catch(err => {
    console.log(err);
  });

