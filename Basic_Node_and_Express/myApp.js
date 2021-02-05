var express = require('express');
const bodyParser = require('body-parser')
var app = express();
// console.log(__dirname)
app.get('/',
function(req, res){
  res.send('Hello Express')
})
app.get('/',
function(req, res) {
  res.sendFile(__dirname+'/views/index.html')
})

app.use(express.static(__dirname + '/public'))

function requestInfoMiddleware(req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip);
  next()
}

app.use(requestInfoMiddleware)

const message = "Hello json";
app.get("/json", 
    (req, res) => res.json(
        {"message": process.env.MESSAGE_STYLE === "uppercase" ? message.toUpperCase() : message
    })
);

function addTimeMiddleware(req, res, next){
  req.time = new Date().toString()
next()
}

app.get('/now', addTimeMiddleware , function(req, res){
  res.json({time: req.time})
})

app.get('/:word/echo', function (req, res) {
  res.json({echo: req.params.word})
})

app.route('/name').get(
function(req, res) {
  res.send({name: req.query.first + ' ' + req.query.last})
})

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.route('/name').post(
  function(req, res) {
    res.send({name: req.body.first + ' ' + req.body.last})
  }
)



















 module.exports = app;
