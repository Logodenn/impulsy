const express = require('express');
const router = express.Router();

router.get("/howItWorks", (req, res) => {
    res.render('howItWorks', {message: "hello world"});
});

module.exports = router;