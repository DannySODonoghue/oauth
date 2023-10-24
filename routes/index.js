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


router.get('/', (req, res, next) => {
  const googleURL = getGoogleOAuthURL();
  res.render('index', 
  {
    clientID,
    googleURL
  })
})

router.get('/verified', (req, res, next) => {
  res.render('home', {
    name: req.query.name,
    email: req.query.email,
    picture: req.query.picture,
    family_name: req.query.family_name
  })
})


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

    console.log(googleUser.email);
    console.log(googleUser.name);
    console.log(googleUser.picture);
    console.log(googleUser.family_name);

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


module.exports = router
