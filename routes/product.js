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

            const result = query.recordsets[0];
            if(result[0] == undefined) {
               res.write("<div class='error-message'>Product price/name is undefined!</div>");
               return;
            }
            price = result[0].productPrice; //gets price
            name = result[0].productName;
            imageURL = await displayImage.getImageUrl(id);

            // Begin HTML structure with inline CSS
            res.write(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f9;
                                margin: 0;
                                padding: 20px;
                            }
                            .product-container {
                                text-align: center;
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                max-width: 400px;
                                margin: 20px auto;
                            }
                            .product-name {
                                font-size: 24px;
                                color: #333;
                                margin-bottom: 20px;
                            }
                            .product-image {
                                max-width: 100%;
                                max-height: 300px;
                                border-radius: 8px;
                                margin-bottom: 20px;
                            }
                            .product-links a {
                                font-size: 18px;
                                color: #007BFF;
                                text-decoration: none;
                                padding: 10px;
                                margin: 10px;
                                display: inline-block;
                                border-radius: 5px;
                                background-color: #f1f1f1;
                                transition: background-color 0.3s;
                            }
                            .product-links a:hover {
                                background-color: #e0e0e0;
                            }
                            .error-message {
                                color: red;
                                text-align: center;
                                font-size: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="product-container">
                            <div class="product-name">${name}</div>
            `);

            if(imageURL != undefined && imageURL != null) {
                res.write(`
                    <img src='/img/${imageURL}' alt='product' class="product-image">
                `);
            } else {
                res.write("<div class='error-message'>Image not found.</div>");
            }

            res.write(`
                            <div class="product-links">
                                <a href='addcart?id=${id}&name=${name}&price=${price}'> <i>Buy</i> </a>
                                <a href='listprod'> <i>Continue shopping</i> </a>
                            </div>
                       
               
            `);
            //takes you to the review page
            res.write(`  <a href='comment?productId=${id}'> <i>Leave a comment or see comments</i> </a>
                         </div>
                    </body>

                    </html>
                
                `);

            console.log(id);

            res.end();
        } catch(err) {
            console.dir(err);
            res.write("<div class='error-message'>" + err + "</div>");
            res.end();
        }
    })();
});

module.exports = router;
