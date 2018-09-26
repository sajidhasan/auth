const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/auth');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String
});

const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');


//home route
app.get('/', (req, res) => {
  res.sendFile('auth.html', { root: __dirname});
});

app.get('/success', (req, res) => {
  res.send('Welcome ' + req.query.username + '!!');
});

app.get('/error', (req, res) => {
  res.send('error loging in!');
});

passport.serializeUser(function(user, cb){
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
  User.findById(id, function(err, user){
    cb(err, user);
  });
});

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done){
    UserDetails.findOne({
      username: username
    }, function(err, user){
      if(err){
        return done(err);
      }
      if(!user){
        return done(null, false)
      }
      if(user.password != password){
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

app.post('/',
  passport.authenticate('local', {failureRedirect: '/error'}),
  function(req, res){
    res.redirect('/success?username=' + req.user.username);
});



const PORT = 8000;
app.listen(PORT, ()=>{
  console.log('Server running on port ' + PORT);
});
