const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');
const protect = require('../middleware/authMiddleware');

// Create a new List
// POST /api/lists
router.post('/', protect, async (req, res) => {
  const { title, boardId, position } = req.body;

  try {
    // Verify board ownership (optional but recommended)
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const list = await List.create({
      title,
      boardId,
      position: position || 0
    });
    
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update List (Title or Position)
// PUT /api/lists/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Update fields if they exist in request body
    list.title = req.body.title || list.title;
    list.position = req.body.position !== undefined ? req.body.position : list.position;

    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete List
// DELETE /api/lists/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // CASCADE DELETE: Delete all cards in this list first
    await Card.deleteMany({ listId: list._id });
    
    // Delete the list itself
    await list.deleteOne();

    res.json({ message: 'List and associated cards removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;