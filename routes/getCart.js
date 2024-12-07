const express = require('express');
const router = express.Router();
const order = require('./listorder');
const sql = require('mssql');
/*
- NOTE --> CART PERSISTS BETWEEN SESSIONS!
*/
router.get('/', async function(req, res, next) {
    //load 
    const customerId = req.session.customerId;
    if(customerId)
    {
        //first check to see if database has created a ordersummary for this cart
        let norderId = 0;
         const checkOrdersummaryEmptySql = "select * from incart join ordersummary on incart.orderId = ordersummary.orderId where ordersummary.customerId = @custId;";
        const orderEmptyResponse = await order.getPreparedList(checkOrdersummaryEmptySql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
        
        norderId = orderEmptyResponse[0][0].orderId[0];

         
        const rows = orderEmptyResponse[0];
        const productListFromDb = [];
        for(let i = 0; i < rows.length; i++)
        {
           let orderId = norderId;
           let productId = rows[i].productId;
           let quantity = rows[i].quantity;
           let price = rows[i].price;
           productListFromDb.push({id : productId, quantity : quantity, price : price});
        }
        req.session.productList = productListFromDb;
       
      
    }
  
    res.redirect('/showcart');
    console.log(req.session.customerId);

});
router.get('/destroyonleave', async function(req, res, next){
    
   let norderId = 0;
   const customerId = req.session.customerId;
   const checkOrdersummaryEmptySql = "select * from incart join ordersummary on incart.orderId = ordersummary.orderId where ordersummary.customerId = @custId;";
   const orderEmptyResponse = await order.getPreparedList(checkOrdersummaryEmptySql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
   if(orderEmptyResponse[0].length == 0)
   {
    res.redirect('/ship');
    return;
   }
   const deletePreviousData = await order.insertPreparedList("delete from incart where orderId = @1", [{inputName : '1', inputType : sql.Int , inputValue : norderId}]);
   res.redirect('/ship');
});
router.get('/removeQFromDb', async function(req,res,next){
   
    //session product list already has changed. 
    const customerId = req.session.customerId;
    var orderId = 0;
    var productList = req.session.productList;
    const checkOrdersummaryEmptySql = "select * from incart join ordersummary on incart.orderId = ordersummary.orderId where ordersummary.customerId = @custId;"; 
    const orderEmptyResponse = await order.getPreparedList(checkOrdersummaryEmptySql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
    
    orderId = orderEmptyResponse[0][0].orderId[0]; //get order id.

    const deletePreviousData = await order.insertPreparedList("delete from incart where orderId = @1", [{inputName : '1', inputType : sql.Int , inputValue : orderId}]);
    
    for(let i = 0; i < productList.length; i++)
    {
    const insertInCartSql = "insert into incart VALUES ( @number , @2 , @3 , @4 )";
    const insertInCart = await order.insertPreparedList(insertInCartSql, 
        [{inputName : 'number', inputType : sql.Int, inputValue : orderId},
        {inputName : '2', inputType : sql.Int, inputValue : productList[i].id},
        {inputName : '3', inputType : sql.Int, inputValue : productList[i].quantity},
        {inputName : '4', inputType : sql.Decimal, inputValue : productList[i].price}]
    );
    }
    res.redirect('/showcart');
    

});

router.get('/save', async function(req,res,next){
    // save 
     const customerId = req.session.customerId;
    var orderId = 0;
    let productList = req.session.productList;
        const checkOrdersummaryEmptySql = "select * from incart join ordersummary on incart.orderId = ordersummary.orderId where ordersummary.customerId = @custId;";
        const orderEmptyResponse = await order.getPreparedList(checkOrdersummaryEmptySql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
        if(orderEmptyResponse[0] == undefined || orderEmptyResponse[0] == null) //order summary does not exist. we must insert one into db.
        {  
            const insertOrderAndGetKeySql = "insert into ordersummary(orderDate, totalAmount, shiptoAddress, shiptoCity,shiptoState, shiptoPostalCode, shiptoCountry, customerId) OUTPUT INSERTED.orderId values (null,null,null,null,null,null,null,@customerId)";
            const insertOrderAndGetKey = await order.insertPreparedList(insertOrderAndGetKeySql, [{inputName : 'customerId', inputType : sql.Int, inputValue : customerId}]);
            orderId = insertOrderAndGetKey[0][0].orderId;
          //  res.redirect('/showcart');
            console.log("order response undefined")
         //   res.end();
          //  return;
           
        }
        else if(orderEmptyResponse[0].length <= 0){

            //creates a new ordersummary for this customer's incart list
            const insertOrderAndGetKeySql = "insert into ordersummary(orderDate, totalAmount, shiptoAddress, shiptoCity,shiptoState, shiptoPostalCode, shiptoCountry, customerId) OUTPUT INSERTED.orderId values (null,null,null,null,null,null,null,@customerId)";
            const insertOrderAndGetKey = await order.insertPreparedList(insertOrderAndGetKeySql, [{inputName : 'customerId', inputType : sql.Int, inputValue : customerId}]);
            orderId = insertOrderAndGetKey[0][0].orderId;
         
            console.log("order response length == 0")

            
        }
        else
        {
            //order summary already exists 
            orderId = orderEmptyResponse[0][0].orderId[0];
        }

    //add/updates values in the cart with the session's product list
   
    for(let i = 0; i < productList.length; i++)
    {
    const checkIfrowExistsqls = "select productId from incart where orderId = @ord and productId = @productId";
    const doesrowExist = await order.getMultipleParamPreparedList(checkIfrowExistsqls, [ {inputName : 'ord', inputType : sql.Int, inputValue : orderId}, {inputName: 'productId', inputType: sql.Int, inputValue : productList[i].id},]);
    if(doesrowExist[0].length > 0) //if the row's size is greater than zero, we can update the exiting row's quantity.  
    {
        const updateinCartSql = "update incart(quantity) set quantity = quantity + 1 where orderId = @1 and productId = @2;";
        const makeupdatonincart = await order.insertPreparedList(updateinCartSql, [{inputName : 1, inputType : sql.Int, inputValue : orderId}, {inputName : 2, inputType : sql.Int, inputValue : productList[i].id}] );
    }
    else //the product in the cart doesn't exist.
    {
        const insertInCartSql = "insert into incart VALUES ( @number , @2 , @3 , @4 )";
        const insertInCart = await order.insertPreparedList(insertInCartSql, 
            [{inputName : 'number', inputType : sql.Int, inputValue : orderId},
            {inputName : '2', inputType : sql.Int, inputValue : productList[i].id},
            {inputName : '3', inputType : sql.Int, inputValue : productList[i].quantity},
            {inputName : '4', inputType : sql.Decimal, inputValue : productList[i].price}]
        );
    }
    }
    let redirection = "/getCart";
    res.redirect(redirection);
    return;
});


module.exports = router;