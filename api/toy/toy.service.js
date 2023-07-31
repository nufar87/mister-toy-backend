const dbService = require('../../services/db.service');
const utilService = require('../../services/utilService.js');
const ObjectId = require('mongodb').ObjectId;

async function query(filterBy) {
  const criteria = _buildCriteria(filterBy);
  const collection = await dbService.getCollection('toy');
  var toys = await collection.find(criteria).toArray();
  return toys;
}

async function getById(toyId) {
  console.log('toyId', toyId);
  const collection = await dbService.getCollection('toy');
  const id = new ObjectId(toyId);
  const toy = collection.findOne({ _id: id });
  return toy;
}

async function remove(toyId) {
  const collection = await dbService.getCollection('toy');
  await collection.deleteOne({ _id: new ObjectId(toyId) });
  return toyId;
}

async function add(toy) {
  const collection = await dbService.getCollection('toy');
  const { ops } = await collection.insertOne(toy);
  return ops[0];
}
async function update(toy) {
  var id = new ObjectId(toy._id);
  delete toy._id;
  const collection = await dbService.getCollection('toy');
  await collection.updateOne({ _id: id }, { $set: { ...toy } });
  toy._id = id;
  return toy;
}

async function addReview(review, toyId) {
  try {
    const collection = await dbService.getCollection('toy');
    review.id = utilService.makeId();
    review.createdAt = Date.now();
    await collection.updateOne(
      { _id: ObjectId(toyId) },
      { $push: { reviews: review } }
    );
    return review;
  } catch (err) {
    console.error('addReview error:', err);
    throw err;
  }
}

async function addMsg(toyId, msg) {
  const toy = await getById(toyId);
  toy.msgs = toy.msgs || [];
  toy.msgs.push(msg);
  update(toy);
}

function _buildCriteria(filterBy) {
  const criteria = {};
  console.log('filterBy', filterBy);
  if (filterBy.name) {
    const txtCriteria = { $regex: filterBy.name, $options: 'i' };
    criteria.name = txtCriteria;
  }
  return criteria;
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  addReview,
  addMsg,
};
