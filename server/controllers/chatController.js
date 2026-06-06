const Conversation = require('../models/Conversation');
const { getGeminiResponse } = require('../config/gemini');

// Send question and get AI response
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Get AI response from Gemini
    const answer = await getGeminiResponse(question);
    
    // Store in database
    const conversation = new Conversation({
      question: question.trim(),
      answer: answer
    });
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: conversation._id,
        question: conversation.question,
        answer: conversation.answer,
        timestamp: conversation.timestamp
      }
    });
    
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

module.exports = { askQuestion };