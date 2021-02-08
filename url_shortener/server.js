require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const validUrl = require('valid-url')
const mongoose = require('mongoose')
const { pick } = require('lodash')
// Basic Configuration
const port = process.env.PORT || 3000;
const router = express.Router()

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());


// Connect to mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})

// Check Mongoose
router.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

// Set up URL database
const {schema} =mongoose;
const URLSchema = { original_url: {type: String, required: true},
short_url: Number, created_at: Date}
const URLModel = mongoose.model('URL', URLSchema)

function catchInvalidURL (req, res, next) {
  const suspect = req.body.url
  if (validUrl.isUri(suspect)) {
  return next()
  }
  res.send({ error: 'invalid url' })
}

async function controller (req, res){
  const originalUrl = req.body.url
  const lastUrlEntry = await URLModel.findOne().sort({ created_at: -1 }).exec()
  const newURLEntry = {original_url: originalUrl, short_url: lastUrlEntry ? lastUrlEntry.short_url+1 : 1, created_at: Date.now()}
  const responseObject = await URLModel.create(newURLEntry)
  res.json(pick(responseObject, ['original_url', 'short_url']))
}

// URL shortener
app.post('/api/shorturl/new',catchInvalidURL, controller)

async function redirectToOriginalURL (req, res) {
  const shortUrlValue = req.params.shortUrl
  console.log(shortUrlValue)
  const isURLAvailable = await URLModel.findOne({short_url: shortUrlValue}).exec()
  console.log(isURLAvailable)
  if(isURLAvailable) {
  res.redirect(shortUrlValue.original_url)
  }
  res.send('Short URL does not exist in our DB')
}
app.get('/api/shorturl/:shortUrl', redirectToOriginalURL)

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
