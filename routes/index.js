const { query } = require('express');
const { Router } = require('express');
const { restQuery } = require('saxa/src/Realm');
const axios = require('axios');
const qs = require("qs");
const jwt = require("jsonwebtoken");
const url = require('url');
const router = Router()

const clientID = process.env.GOOGLE_CLIENT_ID;
const redirectUri = process.env.SERVER_ENDPOINT;
const origin = process.env.SERVER_ROOT_URI;

function getGoogleOAuthURL() {
  const rootURL = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri,
    client_id: clientID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ")
  }
  
  const queryString = new URLSearchParams(options);

  return `${rootURL}?${queryString.toString()}`;
}

// landing page
router.get('/', (req, res, next) => {
  const googleURL = getGoogleOAuthURL();
  res.render('index', 
  {
    clientID,
    googleURL
  })
})

// validated user gets directed here
router.get('/verified', (req, res, next) => {
  res.render('home', {
    name: req.query.name,
    email: req.query.email,
    picture: req.query.picture,
    family_name: req.query.family_name
  })
})

// google auth page
router.get('/api/sessions/oauth/google', async (req, res, next) => {
  const code = req.query.code;
  const URL = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: clientID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }

  try {
    const result = await axios.post(URL, qs.stringify(values), 
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const { id_token, access_token } = result.data;

    const googleUser = jwt.decode(id_token);

    return res.redirect(url.format({
      pathname:`${origin}/verified`,
      query: {
         "email": googleUser.email,
         "name": googleUser.name,
         "picture":googleUser.picture,
         "family_name": googleUser.family_name
       }
    }));

  } catch(e) {
    console.error(e);
    console.log('Failed to fetch google oauth tokens');
  }
});

// prompt user for sign in info
router.get('/signin', (req, res, next) => {
  res.render('signin', {})
})

// prompt user for sign up info
router.get('/signup', (req, res, next) => {
  res.render('signup', {})
})

// issue otp and prompt user for otp
router.get('/otp/enterotp', (req, res, next) => {
  res.render('otp', {})
})

// check username and password are valid before issueing otp
router.post('/check', (req, res, next) => {
  console.log("in check sign in");
  console.log(req.body.email);
  console.log(req.body.password);
  res.redirect('/otp/enterotp')
})

// gather and take account of user entered info
router.post('/signup/collectinfo', (req, res, next) => {
  console.log("in collect sign up info");
  console.log(req.body.email);
  console.log(req.body.password);
  console.log("create unverified user");
  res.redirect('/otp/enterotp')
})

// check user entered otp
router.post('/otp/checkotp', (req, res, next) => {
  console.log('in check otp');
  console.log(req.body.otp);
  res.redirect('/verified')
})

// user forgot password
router.get('/signin/forgot_password', (req, res, next) => {
  res.render('forgot_password', {})
})

// user gets prompted for otp
router.post('/signin/forgot_password/otp', (req, res, next) => {
  res.render('forgot_pwd_otp', {})
})

// on successful otp password user is prompted for new password
router.post('/signin/forgot_password/otp/enter', (req, res, next) => {
  res.render('enter_new_password', {})
})

// users new password is updated in system and they are redirected to main landing page
router.post('/signin/forgot_password/otp/enter/confirm', (req, res, next) => {
  console.log(req.body.password);
  res.redirect('/');
})

module.exports = router
