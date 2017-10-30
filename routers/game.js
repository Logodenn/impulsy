const express = require('express');
const router = express.Router();
const db = require('./models/controllers');

router
.get("/", (req, res) => {
    //{tickets:tickets}
    // Trend track --> Youtube ? 
    // Most played track 
    // Favorite track --> player connected ? 
    // 
    res.render('game', { mostPlayed: db.models.track.mostPlayed });
});

module.exports = router;