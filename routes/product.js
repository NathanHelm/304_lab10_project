const express = require('express');
const router = express.Router();
const sql = require('mssql');
const displayImage = require('./displayImage');


router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    (async function() {
        try {

            
            let id =  req.query.id;
            let price = undefined;
            let name = undefined;
            let imageURL = undefined;
            const sqlQuery = "select productPrice, productName from product where productId = @id;";
            let pool = await sql.connect(dbConfig);
            const query = await pool.request().input('id', sql.Int, id)
            .query(sqlQuery);


            const result = query.recordsets[0]
            if(result[0] == undefined)
            {
               res.write("product price/name is undefined!");
               return;
            }
            price = result[0].productPrice; //gets price
            name = result[0].productName;
            imageURL = await displayImage.getImageUrl(id);
            res.write("<h1>"+ name +"</h1>");
            if(imageURL != undefined || imageURL != null)
            {
            res.write("<img src='"+ imageURL +"' alt='product'>");
            }
            else
            {
            res.write("image not found.");
            }


            res.write("<h1><a href='addcart?id=" + id + "&name=" + name + "&price=" + price + "'> <i>buy</i> </a></h1>");
            res.write("<h1><a href='listprod'> <i>continue shopping</i> </a></h1>");

            console.log(id);
            

	// Get product name to search for
	// TODO: Retrieve and display info for the product

	// TODO: If there is a productImageURL, display using IMG tag

	// TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.

	// TODO: Add links to Add to Cart and Continue Shopping

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
