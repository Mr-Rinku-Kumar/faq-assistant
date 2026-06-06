const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster search (bonus feature)
conversationSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Conversation', conversationSchema);