const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    const username = false;
    if (req.session.username) {
        username = req.session.username;
        req.session.username = false;
    }
    res.render('index', {
        title: "Welcome to SweetToGo",
        username : username
    });
  
})

module.exports = router;
