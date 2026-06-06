<img width="1919" height="787" alt="streaming" src="https://github.com/user-attachments/assets/3bad034e-c8d4-4417-8a4a-df903d36cfe5" /># 🤖 AI-Powered FAQ Assistant

A full-stack AI chatbot application that answers user questions using Google's Gemini AI, stores conversation history in MongoDB, and features real-time streaming responses with dark mode support.

## ✨ Features

- 💬 **AI-Powered Responses** - Uses Google's Gemini AI for intelligent answers
- 📝 **Conversation History** - All chats saved to MongoDB with timestamps
- 🔍 **Search Functionality** - Search through previous conversations
- 🌙 **Dark Mode** - Toggle between light and dark themes (saves preference)
- ⚡ **Streaming Responses** - Watch AI responses appear word by word
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 💾 **Persistent Storage** - Load and continue previous conversations

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- Axios for API calls
- Context API for state management

### Backend  
- Node.js + Express.js
- MongoDB + Mongoose
- Google Gemini AI API
- Server-Sent Events (SSE) for streaming

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key ([Get free key](https://aistudio.google.com/))

## 🚀 Installation

### 1. Clone the repository
git clone https://github.com/Mr-Rinku-Kumar/faq-assistant.git
cd faq-assistant

2. Backend Setup
bash
cd server
npm install
Create .env file in server directory:

env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/faq_assistant
PORT=5000
3. Frontend Setup
bash
cd ../client
npm install
4. Run the Application
Terminal 1 - Backend:

bash
cd server
npm run dev
Terminal 2 - Frontend:

bash
cd client
npm run dev
Open http://localhost:5173 in your browser.

🎮 Usage Guide
Ask a Question - Type your question and press Send

Watch Streaming - Responses appear in real-time

Load Old Chats - Click any history item to continue that conversation

Search - Use search bar in history to find specific topics

Dark Mode - Click the 🌙/☀️ button to toggle themes

Clear Chat - Use "Clear Chat" to start fresh

📁 Project Structure
text
faq-assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── DarkModeContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/                 # Node backend
│   ├── models/
│   │   └── Conversation.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   ├── streamController.js
│   │   └── historyController.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   └── historyRoutes.js
│   ├── config/
│   │   └── gemini.js
│   ├── server.js
│   └── package.json
└── README.md
🔧 API Endpoints
Method	Endpoint	Description
POST	/api/chat	Send question, get AI response
POST	/api/chat/stream	Streaming AI response
GET	/api/history	Get all conversations
GET	/api/history/search?q=	Search conversations
GET	/api/history/:id	Get single conversation
🎯 Features in Detail
Dark Mode
Toggle with button in header

Preference saved to localStorage

Respects system preference on first visit

Smooth transitions between modes

Streaming Responses
Real-time word-by-word generation

Visual cursor indicates active streaming

Fallback to normal mode if streaming fails

🎥 Demo Video
https://www.loom.com/share/954fdb9802ab46c88c1f6171478b11a0
Watch Demo Video

🚧 Future Improvements
User authentication

Export conversations (PDF/JSON)

Voice input support

Multiple AI model selection

Conversation categories/tags

Docker containerization


👨‍💻 Author
Rinku Kumar

🙏 Acknowledgments
Google Gemini AI for free API access

MongoDB for database services

Tailwind CSS for styling
