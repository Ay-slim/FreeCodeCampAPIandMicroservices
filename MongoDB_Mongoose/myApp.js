require('dotenv').config();
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})

const { Schema } = mongoose;

const personSchema = new Schema({
  name: {type: String, required: true},
  age: Number,
  favoriteFoods: [String] 
})

const Person = mongoose.model('Person', personSchema);


const createAndSavePerson = (done) => {
  const ayo = new Person({name: 'Ayo', age: 26, favoriteFoods: ['Food']})
  ayo.save(function(err, data){
    if(err) return console.error(err);
    done(null, data)
  });
};

const arrayOfPeople = [
  {name: "Frankie", age: 74, favoriteFoods: ["Del Taco"]},
  {name: "Sol", age: 76, favoriteFoods: ["roast chicken"]},
  {name: "Robert", age: 78, favoriteFoods: ["wine"]}
]

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, function(err, people){
    if(err) return console.error(err)
    done(null, people)
  });
};

const findPeopleByName = (personName, done) => {
  Person.find({name: personName}, function(err, person){
    if (err) return console.error(err)
    done(null, person)
  });
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, function(err, food){
    if (err) return console.error(err)
    done(null, food)
  });
};

const findPersonById = (personId, done) => {
  Person.findById({_id: personId}, function(err, personId){
    if(err) return console.error(err)
    done(null, personId)
  });
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findById(personId, function(err, person){
    if(err) return console.error(err)
    person.favoriteFoods.push(foodToAdd)
    person.save((err, savedPerson)=>{
      if(err) return console.error(err)
      done(null, savedPerson)
    })
  })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate({name: personName}, {age: 20}, {new: true}, (err, updatedAge) => {
    if(err) return console.error(err)
    done(null, updatedAge)
  });
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, removedPerson)=>{
    if (err) return console.error(error)
    done(null, removedPerson)
  });
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name: nameToRemove}, (err, removedName)=>{
    if(err) return console.log(error)
    done(null, removedName)
  })
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person.find({favoriteFoods: foodToSearch}).sort({name: 1}).limit(2).select('name food').exec((err, personFound) => {
    if (err) return console.error(error)
    done(null, personFound)
  });
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;