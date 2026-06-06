const express = require('express');
const { 
  getAllConversations, 
  getConversationById,
  searchConversations 
} = require('../controllers/historyController');
const router = express.Router();

router.get('/', getAllConversations);
router.get('/search', searchConversations);
router.get('/:id', getConversationById);

module.exports = router;