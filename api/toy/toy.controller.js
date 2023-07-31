const toyService = require('./toy.service.js');
const authService = require('../auth/auth.service.js');
const logger = require('../../services/logger.service');
const { broadcast } = require('../../services/socket.service.js');

async function getToys(req, res) {
  try {
    const queryParams = req.query;
    console.log('try to get toys - toy controller');

    const toys = await toyService.query(queryParams);
    res.json(toys);
  } catch (err) {
    console.error('getToys error:', err);
    res.status(404).send(err);
  }
}

async function getToyById(req, res) {
  try {
    const toyId = req.params.id;
    const toy = await toyService.getById(toyId);
    res.json(toy);
  } catch (err) {
    console.error('getToyById err:', err);
    res.status(404).send(err);
  }
}

async function addToy(req, res) {
  const toy = req.body;
  try {
    const addedToy = await toyService.add(toy);
    const loggedinUser = authService.validateToken(req.cookies.loginToken);
    broadcast({ type: 'something-changed', userId: loggedinUser._id });
    res.json(addedToy);
  } catch (err) {
    console.error('addToy error:', err);
    res.status(500).send(err);
  }
}

async function updateToy(req, res) {
  try {
    const toy = req.body;
    const updatedToy = await toyService.update(toy);
    res.json(updatedToy);
  } catch (err) {
    console.error('updateToy error:', err);
    res.status(500).send(err);
  }
}

async function removeToy(req, res) {
  try {
    const toyId = req.params.id;
    const removedId = await toyService.remove(toyId);
    res.send(removedId);
  } catch (err) {
    console.error('removeToy error:', err);
    res.status(500).send(err);
  }
}

async function addReview(req, res) {
  const toyId = req.params.id;
  const review = req.body;
  try {
    const addedReview = await toyService.addReview(review, toyId);
    res.send(addedReview);
  } catch (err) {
    console.error('addReview error:', err);
    res.status(500).send(err);
  }
}

module.exports = {
  getToys,
  getToyById,
  addToy,
  updateToy,
  removeToy,
  addReview,
};
