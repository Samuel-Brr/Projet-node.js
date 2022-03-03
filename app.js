const express = require('express');

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false })); // Permet d'avoir accés au body de la requete via l 'url
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('621f69a8ea58a64a58ccea72')
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
    "mongodb+srv://Sml-Brr:YVmG4mNq24wxbku2@cluster0.jt4fy.mongodb.net/shop?retryWrites=true&w=majority",{ useNewUrlParser: true,
    useUnifiedTopology: true }, 
  )
  .then(result => {
    User.findOne().then(user => {
      if(!user){
        const user = new User({
          name: 'Sam',
          email: 'sam@test.com',
          cart: {
            items: []
          }
        })
        user.save()  
      }
    })
    app.listen(3000, ()=>{
      console.log("listening on port 3000...")
    });
    console.log("connected to database !")
  })
  .catch(err => {
    console.log(err);
  });

