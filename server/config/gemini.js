const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiResponse(question, retryCount = 0) {
  const maxRetries = 3;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }]
    });
    
    const response = await result.response;
    const answer = response.text();
    
    return answer;
    
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);
    
    // Retry logic for 503 and rate limit errors
    if (error.message.includes('503') || error.message.includes('high demand')) {
      if (retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        await delay(waitTime);
        return getGeminiResponse(question, retryCount + 1);
      }
    }
    
    throw new Error(`AI Service temporarily unavailable. Please try again.`);
  }
}

module.exports = { getGeminiResponse };