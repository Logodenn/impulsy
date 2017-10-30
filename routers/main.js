const express = require('express');
const router = express.Router();

router
.get("/", (req, res) => {
    res.render('index', { message: 'Hello World' });
});

router
.get('/hallOfFame', function(req, res) 
{
  res.render('hallOfFame', { message: "Hello World!" });
});

router
.get('/trackSelection', function(req, res) 
{
  res.render('trackSelection', { message: "Hello World!" });
});


module.exports = router;