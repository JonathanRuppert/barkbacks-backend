const express = require('express');
const router = express.Router();

let pets = []; // Temporary in-memory store — replace with DB logic later

router.get('/', (req, res) => {
  res.status(200).json(pets);
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Pet name is required' });
  }

  const newPet = { name };
  pets.push(newPet);

  res.status(200).json({ message: 'Pet added', pet: newPet });
});

module.exports = router;
