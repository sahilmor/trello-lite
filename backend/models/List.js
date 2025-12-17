const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
  title: { type: String, required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  position: { type: Number, default: 0 }, // For drag-and-drop ordering later
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);