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
router.get('/save', async function(req,res,next){
    // save 
     const customerId = req.session.customerId;
    var orderId = 0;
    let productList = req.session.productList;
        const checkOrdersummaryEmptySql = "select * from incart join ordersummary on incart.orderId = ordersummary.orderId where ordersummary.customerId = @custId;";
        const orderEmptyResponse = await order.getPreparedList(checkOrdersummaryEmptySql, {custId : customerId}, [{inputName : 'custId', inputType : sql.Int}]);
        if(orderEmptyResponse[0] == undefined || orderEmptyResponse[0] == null) //order summary does not exist. we must insert one into db.
        {  
            const insertOrderAndGetKeySql = "insert into ordersummary(customerId) OUTPUT INSERTED.orderId values (@customerId);";
            const insertOrderAndGetKey = await order.insertPreparedList(insertOrderAndGetKeySql, [{inputName : 'customerId', inputType : sql.Int, inputValue : customerId}]);
            orderId = insertOrderAndGetKey[0].orderId
          //  res.redirect('/showcart');
            console.log("order response undefined")
         //   res.end();
          //  return;
           
        }
        else if(orderEmptyResponse[0].length <= 0){

            const insertOrderAndGetKeySql = "insert into ordersummary(orderDate, totalAmount, shiptoAddress, shiptoCity,shiptoState, shiptoPostalCode, shiptoCountry, customerId) OUTPUT INSERTED.orderId values (null,null,null,null,null,null,null,@customerId)";
            const insertOrderAndGetKey = await order.insertPreparedList(insertOrderAndGetKeySql, [{inputName : 'customerId', inputType : sql.Int, inputValue : customerId}]);
            orderId = insertOrderAndGetKey[0][0].orderId;
          //  res.redirect('/showcart');
         //   res.end();
            console.log("order response length == 0")
        //    return;
            
        }
        else
        {
            orderId = orderEmptyResponse[0].orderId;
        }
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
    let redirection = "/getCart";
    res.redirect(redirection);
});


module.exports = router;