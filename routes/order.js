const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');
const listOrd = require('./listorder');

router.get('/', async function(req, res, next) {

   // res.setHeader('Content-Type', 'text/html');
    //res.write("<title>YOUR NAME Grocery Order Processing</title>");

    let productList = false;
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList;
    }
    //productList = [{"id": 1, "name" : "testprod", "price" : 20, "quantity" : 1}]; //temporary object array.
  

    const customerId = req.query.customerId;

    if(customerId == null || customerId === '')
    {
        res.write("<h1> customer's id is not defined! </h1>");
        res.end();
        return;
    }
    if(productList == false)
    {
        res.write("<h1> product list is empty! </h1>");
        res.end();
        return;
    }
    const customeronIdSql = "select orders.dbo.customer.address, orders.dbo.customer.city, orders.dbo.customer.state,  orders.dbo.customer.postalCode,orders.dbo.customer.country, orders.dbo.customer.customerId from orders.dbo.customer where orders.dbo.customer.customerId = @custId;";
    const customerDataResult = await listOrd.getPreparedList(customeronIdSql, {custId : customerId} , [{inputName :'custId', inputType: sql.Int}]);
    let result = customerDataResult[0];
   
    for(let i = 0; i < result.length; i++)
    {                                                                                                                                   //start here .... 
    const insertOrderSql = "update ordersummary(orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) set (@1, @2, @3, @4, @5, @6, @7, @8) where ordersummary.orderId In (select ordersummary.* from ordersummary join incart on ordersummary.orderId = incart.orderId where customerId = @8);";
    
        const insertOrderResult = await listOrd.insertPreparedList(insertOrderSql, [{inputName : '1', inputType : sql.Date, inputValue: new Date()}, 
        {inputName : '2', inputType : sql.Int, inputValue : 0}, {inputName : '3', inputType : sql.NVarChar, inputValue : result[i].address},  {inputName : '4', inputType : sql.NVarChar, inputValue : result[i].city},  {inputName : '5', inputType : sql.NVarChar, inputValue : result[i].state},  {inputName : '6', inputType : sql.NVarChar, inputValue : result[i].postalCode},  {inputName : '7', inputType : sql.NVarChar, inputValue : result[i].city},  {inputName : '8', inputType : sql.Int, inputValue : result[i].customerId}] );
        //res.write("<h1> product added! </h1>");
        //console.log(insertOrderResult);
  

    const insertOrderProductResultSql = "Insert Into orders.dbo.orderproduct Values (@1,@2,@3,@4)";
    
    const getorderIdSql = " select incart.orderId from incart join ordersummary on incart.orderId = ordersummary.orderId where customerId = @custId;"
    const getorderId = await listOrd.getPreparedList(getorderIdSql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
    const odId = get[0][0].orderId;
    req.session.orderId = odId;
    for (let i = 0; i < productList.length; i++) {
        let product = productList[i];
        if (!product) {
            continue;
        }
        let productId = product.id;
        let productQuanity = product.quantity;
        let productPrice = product.price; 
        const insertOrderProductResult = await listOrd.insertPreparedList(insertOrderProductResultSql, [{inputName:'1', inputType:sql.Int, inputValue:odId}, {inputName:'2', inputType: sql.Int, inputValue : productId}, {inputName:'3', inputType : sql.Int, inputValue : productQuanity},{inputName: '4', inputType: sql.Decimal, inputValue : productPrice}]);
        const updateOrderProductSql = "update orders.dbo.ordersummary set orders.dbo.ordersummary.totalAmount = @1 * @2 where orders.dbo.ordersummary.orderId = @3;";
        const updateOrderProductResult = await listOrd.insertPreparedList(updateOrderProductSql, [{inputName : '1', inputType : sql.Int, inputValue: productQuanity},{inputName : '2', inputType : sql.Decimal, inputValue: productPrice}, {inputName : '3', inputType : sql.Int, inputValue: odId}]);
        
        // Use product.id, product.name, product.quantity, and product.price here
    }
    //display orders and products. 
    }

    


   


    /**
    Determine if valid customer id was entered
    Determine if there are products in the shopping cart
    If either are not true, display an error message
    **/

    /** Make connection and validate **/

    /** Save order information to database**/


        /**
        // Use retrieval of auto-generated keys.
        sqlQuery = "INSERT INTO <TABLE> OUTPUT INSERTED.orderId VALUES( ... )";
        let result = await pool.request()
            .input(...)
            .query(sqlQuery);
        // Catch errors generated by the query
        let orderId = result.recordset[0].orderId;
        **/

    /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/

    /** Update total amount for order record **/

    /** For each entry in the productList is an array with key values: id, name, quantity, price **/

    /**
        for (let i = 0; i < productList.length; i++) {
            let product = products[i];
            if (!product) {
                continue;
            }
            // Use product.id, product.name, product.quantity, and product.price here
        }
    **/

    /** Print out order summary **/

    /** Clear session/cart **/
    
    req.session.productList = [];
    res.redirect('/ship');
    return;
    //res.end();

});


module.exports = router;
