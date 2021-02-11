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
  const newUserName = req.body.username
  const newEntry = {username: newUserName}
  const responseObject = await UserExerciseModel.create(newEntry)
  res.json(pick(responseObject, ['username', '_id']))
}

async function addExercise(req, res) {
  const incomingData = req.body
  if(incomingData.date === '') {
    incomingData['date'] = Date.now()
  }
  const userDocument = await UserExerciseModel.findOne({_id: incomingData.userId})
  userDocument.exercise.push(pick(incomingData, ['description', 'duration', 'date']))
  await UserExerciseModel.findOneAndUpdate({_id: incomingData.userId}, {exercise: userDocument.exercise})
  res.json(pick(incomingData, ['userId', 'description', 'duration', 'date']))
}


async function getUsers(req, res) {
  const usersArray = await UserExerciseModel.find()
  const arrayToReturn = usersArray.map((object) => {return pick(object, ['_id', 'username'])})
  res.send(arrayToReturn)
}

async function getExerciseLogs(req, res) {
  if(req.query.from && req.query.to && req.query.limit) {
    const userDocument = await UserExerciseModel.findOne({_id: req.query.userId}).exec()
    const fromDate = new Date(String(req.query.from))
    const toDate = new Date(String(req.query.to))
    const exerciseArray = userDocument.exercise.filter((object)=>(object.date>=fromDate && object.date<=toDate))
    const arrayLength = exerciseArray.length
    const arrayToReturn = exerciseArray.slice(arrayLength-req.query.limit, arrayLength)
    res.json({log: arrayToReturn, count: arrayToReturn.length})
  }
  console.log(req.query)
  const userDocument = await UserExerciseModel.findOne({_id: req.query.userId}).exec()
  console.log(userDocument)
  const exerciseArray = userDocument.exercise
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
