const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    // If the product list isn't set in the session,
    // create a new list.
   
    let productList = false;
    if (!req.session.productList) {
        productList = [];
    } else {
        productList = req.session.productList;
    }

    // Add new product selected
    // Get product information
    let id = false;
    let name = false;
    let price = false;
    if (req.query.id && req.query.name && req.query.price) {
        id = req.query.id;
        name = req.query.name;
        price = req.query.price;
    } else {
        res.redirect("/listprod");
    }

    // Update quantity if add same item to order again
    if(productList.length == 0)
    {
        productList.push({
            "id": id,
            "name": name,
            "price": price,
            "quantity": 1
           
        });
    }
    else
    {
    for(let i = 0; i < productList.length; i++)
    {
    if (productList[i].id == id){
        productList[i].quantity = productList[i].quantity + 1;
        break;
    } else {
        productList.push({
            "id": id,
            "name": name,
            "price": price,
            "quantity": 1
           
        });
        break;
    }
    }
    }

    req.session.productList = productList;
    res.redirect('/showcart')
});

module.exports = router;
