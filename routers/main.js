const express = require('express');
const router = express.Router();

router
.get("/", (req, res) => {
    res.render('index', { message: 'Hello World' });
});

module.exports = router;