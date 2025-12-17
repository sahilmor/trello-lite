const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const List = require('../models/List');
const protect = require('../middleware/authMiddleware');

// Create a new Card
// POST /api/cards
router.post('/', protect, async (req, res) => {
  const { title, listId, position } = req.body;

  try {
    // Check if list exists
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const card = await Card.create({
      title,
      listId,
      position: position || 0
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Card (Title, Description, Position, or Move to new List)
// PUT /api/cards/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Update fields
    card.title = req.body.title || card.title;
    card.description = req.body.description || card.description;
    card.position = req.body.position !== undefined ? req.body.position : card.position;
    
    // This allows moving a card to a different list
    if (req.body.listId) {
      card.listId = req.body.listId;
    }

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Card
// DELETE /api/cards/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    await card.deleteOne();
    res.json({ message: 'Card removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;