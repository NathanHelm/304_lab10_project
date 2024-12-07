const express = require('express');
const router = express.Router();


router.post('/', function(req, res, next) {
    //remove the items in the cart when user clicks 'remove'.
    let productId = false;
    let productList = false;
    productId = req.body.productId;
    productList = req.session.productList;
    const newProductList = [];
    if(productId && productList)
    {
       for(let i = 0; i < productList.length; i++)
       {
          if( productList[i] != null || productList[i] != undefined)
          {
          if(productId == productList[i].id)
          {
            let quantity = productList[i].quantity;
            quantity -= 1;
            if(quantity >= 1)
            {
                productList[i].quantity = quantity;
                newProductList.push(productList[i]);
            }
            //if quantity is <= 0, it will not be added to the shopping cart.
          }
          }
       }
    }

    req.session.productList = newProductList;

    res.redirect('/showcart');
});
module.exports = router;