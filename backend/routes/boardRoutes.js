const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const protect = require('../middleware/authMiddleware');

// Create Board
router.post('/', protect, async (req, res) => {
  const { title } = req.body;
  const board = await Board.create({
    title,
    user: req.user._id,
  });
  res.status(201).json(board);
});

// Get All Boards for User
router.get('/', protect, async (req, res) => {
  const boards = await Board.find({ user: req.user._id });
  res.json(boards);
});

// Get Single Board (with Lists and Cards)
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    // Fetch lists associated with this board
    const lists = await List.find({ boardId: req.params.id }).sort('position');

    // Fetch cards for these lists
    // Note: In a production app, you might use Mongo $lookup aggregation for performance
    const cards = await Card.find({ listId: { $in: lists.map(l => l._id) } }).sort('position');

    // Combine them into a structure the frontend will like
    const boardData = {
      ...board._doc,
      lists: lists.map(list => ({
        ...list._doc,
        cards: cards.filter(card => card.listId.toString() === list._id.toString())
      }))
    };

    res.json(boardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;