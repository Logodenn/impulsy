const express = require('express');
var cookies = require("cookies")
const router = express.Router();


router.post("/:id", (req, res) => {
    res.cookie('gameId', req.params.id);
    res.cookie('difficulty', req.body.difficulty);
    res.render('game');
});

module.exports = router;