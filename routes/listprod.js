const express = require('express');
const listOrder = require('./listorder.js');
const router = express.Router();
const sql = require('mssql');


    router.use(express.urlencoded({ extended: true }));

    router.get('/', function (req, res, next) {
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <html>
                <head><title>YOUR NAME Grocery</title></head>
                <body>
                    <h1>Search for a Product</h1>
                    <form method="post" action="/listprod">
                        <label for="productName">Product Name:</label>
                        <input type="text" name="productName" size="50">
                        <input type="submit" value="Submit">
                        <input type="reset" value="Reset">
                    </form>
                    
                </body>
            </html>
        `);
    });


router.post('/', async function (req, res, next) {
    // Get the product name to search fo
    let name = req.body.productName || '';
    console.log(name);
   // name = 's'; //temporary change.
    const word = `%${name}%`;

    const sqlString = "SELECT prod.productId, prod.productName, prod.productPrice FROM orders.dbo.product AS prod WHERE prod.productName LIKE @word;";
    if(name == null && name == undefined)
    {
        res.write("please enter a valid search string");
        res.end();
        return;
    }
        var resultSet = await listOrder.getPreparedList(sqlString,  { word: word}, [{ inputName: 'word', inputType: sql.NVarChar}]);
    
    let productList = resultSet[0];
    let columns = listOrder.getColumns(resultSet);
    res.write("<table>");
    res.write("<tr>");
    for(let i = 0; i < columns.length; i++)
    {
       
        res.write("<th>" + columns[i] + "</th>"); 
       
    }
    res.write("</tr>");
   
    for(let i = 0; i < productList.length; i++)
    {
        res.write("<tr>");
        let productId = productList[i].productId;
        let productName = productList[i].productName;
        let productPrice = productList[i].productPrice.toFixed(2);
        res.write("<td> <a href='addcart?id=" + productId.toString() + "&name=" + productName + "&price=" + productPrice.toString() + "'> <i>buy</i> </a> </td>");
        res.write("<td> <a href='product?id="+ productId.toString() + "'>"+ productName + "</a></td>");
        res.write("<td>" + productPrice + "</td>");
        res.write("</tr>");
       
    }
   
    res.write("</table>");
    res.write("<h2><a href='listprod'> <i>continue shopping</i> </a></h2>");
    res.end();
}); 

    /** $name now contains the search string the user entered
     Use it to build a query and print out the results. **/

    /** Create and validate connection **/

    /** Print out the ResultSet **/

    /** 
    For each product create a link of the form
    addcart?id=<productId>&name=<productName>&price=<productPrice>
    **/

    /**
        Useful code for formatting currency:
        let num = 2.89999;
        num = num.toFixed(2);
    **/

   


module.exports = router;

