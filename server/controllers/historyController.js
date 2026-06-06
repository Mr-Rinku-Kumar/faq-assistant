const Conversation = require('../models/Conversation');

// Get all conversations (latest first)
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ timestamp: -1 }) // Latest first
      .limit(50); // Limit for performance
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
    
  } catch (error) {
    console.error('History controller error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Get single conversation by ID
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.status(200).json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Search conversations (bonus feature)
const searchConversations = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const conversations = await Conversation.find({
      $text: { $search: q }
    }).sort({ score: { $meta: 'textScore' } });
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = { getAllConversations, getConversationById, searchConversations };