const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function streamResponse(req, res) {
  const { question } = req.body;
  
  if (!question || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Use streaming
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: question }] }]
    });

    let fullResponse = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Send chunk to client
      res.write(`data: ${JSON.stringify({ text: chunkText, done: false })}\n\n`);
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Optional: Save to database after streaming completes
    const Conversation = require('../models/Conversation');
    const conversation = new Conversation({
      question: question.trim(),
      answer: fullResponse
    });
    await conversation.save();

  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
}

module.exports = { streamResponse };