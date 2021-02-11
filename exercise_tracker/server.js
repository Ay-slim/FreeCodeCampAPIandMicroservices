const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const {model, Schema} = mongoose
const {pick, omit} = require('lodash')
const bodyParser = require('body-parser')
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
// Connect to mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
//"username":"Ayooluwa","_id":"6024efb1e7c8b40286338e15"
const userExerciseSchema = new Schema({username: {type: String, required: true}, exercise: [{description: String, duration: Number, date: Date}]})

const UserExerciseModel = mongoose.model('User', userExerciseSchema)

async function createUser(req, res) {
  console.log('createUser packet', req.body)
  const newUserName = req.body.username
  const newEntry = {username: newUserName}
  const responseObject = await UserExerciseModel.create(newEntry)
  res.json(pick(responseObject, ['username', '_id']))
}

async function addExercise(req, res) {
  console.log('add exercise packet', req.body)
  const incomingData = req.body
  if(!incomingData.hasOwnProperty('date')) {
    incomingData['date'] = new Date(Date.now()).toDateString()
  }
  incomingData['date'] = new Date(incomingData.date).toDateString()
  const userDocument = await UserExerciseModel.findOne({_id: incomingData.userId})
  userDocument.exercise.push(pick(incomingData, ['description', 'duration', 'date']))
  const response = await UserExerciseModel.findOneAndUpdate({_id: incomingData.userId}, {exercise: userDocument.exercise})
  console.log('addExerciseResponse', {username: response.username, _id: incomingData.userId, description: incomingData.description, duration: incomingData.duration, date: incomingData.date})
  res.json({username: response.username, _id: incomingData.userId, description: incomingData.description, duration: Number(incomingData.duration), date: incomingData.date})
}


async function getUsers(req, res) {
  const usersArray = await UserExerciseModel.find()
  const arrayToReturn = usersArray.map((object) => {return pick(object, ['_id', 'username'])})
  res.send(arrayToReturn)
}

async function getExerciseLogs(req, res) {
  console.log('getexercise packet', req.query)
  const userDocument = await UserExerciseModel.findOne({_id: req.query.userId}).exec()
  let exerciseArray = userDocument.exercise
  if(req.query.from && req.query.to) {
    const fromDate = new Date(String(req.query.from))
    const toDate = new Date(String(req.query.to))
    exerciseArray = exerciseArray.filter((object)=>(object.date>=fromDate && object.date<=toDate))
  }
  if(req.query.limit){
    const arrayLength = exerciseArray.length
    exerciseArray = exerciseArray.slice(arrayLength-req.query.limit, arrayLength)
  }
  console.log(userDocument)
  const exerciseCount = exerciseArray.length
  res.json({log: exerciseArray, count: exerciseCount})
}

app.post('/api/exercise/new-user', createUser)
app.post('/api/exercise/add', addExercise)
app.get('/api/exercise/users', getUsers)
app.get('/api/exercise/log', getExerciseLogs)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
