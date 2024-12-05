const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = false;
    if (req.session.username) {
        username = req.session.username;
       // req.session.username = false;
    }
    // TODO: Display user name that is logged in (or nothing if not logged in)	
    res.render('index', {
        title: "YOUR NAME Grocery Main Page",
        username : username
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
  
})

module.exports = router;
