require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

// In memory database to store urls
let urlDatabase = {};
let idCounter = 1;

function isValidUrl(userInput) {
  try {
    const url = new URL(userInput);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false
  }

}



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//POST endpoint to create a short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)){
    return res.json({error: "Invalid url"})
  }

  const hostName = new URL(originalUrl).hostname;
  dns.lookup(hostName, (err) => {
    if (err) {
      return res.json({error: "Invalid url"})
    }

    let shorturl = Object.keys(urlDatabase).find((key) => urlDatabase[key] === originalUrl);

    if (!shorturl){
      shorturl = idCounter++;
      urlDatabase[shorturl] = originalUrl;
    }

    res.json({originalUrl: originalUrl, shorturl: shorturl})

  })
})

//get endpoint to redirect to the original url
app.get("/api/shorturl/:shorturl", (req, res) => {
  const shorturl = req.params.shorturl;
  const originalUrl = urlDatabase[shorturl]

  if (!originalUrl){
    return res.json({error: "Invalid url"})
  }

  res.redirect(originalUrl)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
