var express = require('express');
var router = express.Router();

// About page route.
router.get('/about', function (req, res) {
  res.send('About this wiki');
})

// About page route.
router.get('/terms', function (req, res) {
    res.send('terms and conditions');
})

module.exports = router;





