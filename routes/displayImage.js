const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let id = req.query.id; //product id. 
    let idVal = parseInt(id);
    if (isNaN(idVal)) {
        res.end();
        return;
    }
});
    async function getImageUrl(idVal) { //changed display image to a function that the product can use. 
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "select productImageURL from product where productId = @id;";

            result = await pool.request()
                .input('id', sql.Int, idVal)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No image record");
                res.end();
                return '';
            } else {
                let productImage = result.recordset[0].productImageURL;

                return productImage;
            }

            //res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            return '';
           // res.end();
        }
    };


module.exports = {router, getImageUrl};
