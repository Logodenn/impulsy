const express = require('express');
const router = express.Router();


router
.get("/:id", (req, res) => {
            var data = 
            {
                gameId : req.params.id,
                track : req.cookies['track'],
                difficulty : req.body.difficulty
            }
            res.render('game', { data });
        });

module.exports = router;