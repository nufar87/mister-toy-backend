const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');
const logger = require('../../services/logger.service');

// async function query(filterBy = {}) {
//   // const criteria = _buildCriteria(filterBy)
//   const collection = await dbService.getCollection('review');
//   // return await collection.find(criteria).toArray()
//   var reviews = await collection
//     .aggregate([
//       { $match: filterBy },
//       {
//         $addFields: {
//           userObjId: { $toObjectId: '$userId' },
//           toyObjId: { $toObjectId: '$toyId' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'user',
//           foreignField: '_id',
//           localField: 'userObjId',
//           as: 'user',
//         },
//       },
//       { $unwind: '$user' },
//       {
//         $lookup: {
//           from: 'toy',
//           foreignField: '_id',
//           localField: 'toyObjId',
//           as: 'toy',
//         },
//       },
//       {
//         $unwind: '$toy',
//       },
//       {
//         $project: {
//           content: 1,
//           user: { _id: 1, username: 1 },
//           toy: { _id: 1, name: 1, price: 1 },
//         },
//       },
//     ])
//     .toArray();
//   return reviews;
// }

// async function query(filterBy = {}) {
//   const criteria = _buildCriteria(filterBy);
//   const collection = await dbService.getCollection('review');
//   // return await collection.find(criteria).toArray()
//   var reviews = await collection.find(criteria).toArray();
//   return reviews;
// }

async function query(filterBy = {}) {
  // const criteria = _buildCriteria(filterBy)
  const collection = await dbService.getCollection('review');
  // return await collection.find(criteria).toArray()
  var reviews = await collection
    .aggregate([
      { $match: filterBy },
      {
        $addFields: {
          userObjId: { $toObjectId: '$userId' },
          toyObjId: { $toObjectId: '$toyId' },
        },
      },
      {
        $lookup: {
          from: 'user',
          foreignField: '_id',
          localField: 'userObjId',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'toy',
          foreignField: '_id',
          localField: 'toyObjId',
          as: 'toy',
        },
      },
      { $unwind: '$toy' },
      {
        $project: {
          content: 1,
          user: { _id: 1, username: 1 },
          toy: { _id: 1, name: 1, price: 1 },
        },
      },
    ])
    .toArray();
  return reviews;
}

async function addReview(review) {
  const collection = await dbService.getCollection('review');
  const addedReview = await collection.insertOne(review);
  return addedReview.ops[0];
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore();
    const { loggedinUser } = store;
    const collection = await dbService.getCollection('review');
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) };
    if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id);
    const { deletedCount } = await collection.deleteOne(criteria);
    return deletedCount;
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err);
    throw err;
  }
}

module.exports = {
  query,
  addReview,
  remove,
};

function _buildCriteria(filterBy) {
  const criteria = {};
  return criteria;
}

// populate(data)
// async function populate(data) {
//   const collection = await dbService.getCollection('user');
//   await collection.insertMany(data)

// }
