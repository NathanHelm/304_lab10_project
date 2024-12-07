const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');
const ord = require('./listorder');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    console.log("shipping...");
    console.log("id --> " + req.session.orderId);

    let orderId = req.session.orderId; //orderId.
    let userId = req.session.username;
    let userPassword = req.session.password;
    // TODO: Get order id


    // TODO: Check if valid order id


    (async function () {
        try {

           

            const orderPriceAndQuantitySql = "select prod.productId, orderproduct.quantity from orderproduct join product as prod on orderproduct.productId  = prod.productId where orderId = @ordId;"; //get order quantity
            const orderPriceAndQuantityResult = await ord.getPreparedList(orderPriceAndQuantitySql,{ordId : orderId},[{inputName : 'ordId', inputType : sql.Int}]);
            let result = orderPriceAndQuantityResult[0];
            for(let i = 0; i < result.length; i++)
            {
                let productId = result[i].productId; //product id from order.
                let quantity = result[i].quantity; //product quantity from order.

                const getInventoryQuantitySql = "select quantity from productinventory where productId = @prodId;";
                const inventoryQuantityResult = await ord.getPreparedList(getInventoryQuantitySql, {prodId : productId}, [{inputName : 'prodId', inputType : sql.Int}]);
                if(inventoryQuantityResult[0][0].quantity == undefined)
                {
                    res.write("<h2>product inventory doesn't exist!</h2>");
                    //drops order if inventory doesn't exist for the product
                      const removeOrderProd = await ord.insertPreparedList("delete from ordersummary where productId = @prodId;", [{inputName: 'prodId', inputType : sql.Int, inputValue : productId}]);
                    continue;
                }
                let previousInventory = inventoryQuantityResult[0][0].quantity;
                let newInventoryQuantity = previousInventory - quantity;
                if(newInventoryQuantity < 0)
                {
                    res.write("<h2> insufficient inventory for order "+ orderId.toString() +" at product number "+ productId.toString() + "! </h2>");
                     const removeOrderProd = await ord.insertPreparedList("delete from ordersummary where productId = @prodId;", [{inputName: 'prodId', inputType : sql.Int, inputValue : productId}]);
                    continue;
                }
               
                res.write("<h2>Ordered product: " + productId.toString() + " Previous Qty: " + quantity.toString() + "Previous Inventory:" + previousInventory.toString()  + " New Inventory " + newInventoryQuantity.toString());
                res.write("<br>");
                 //update quantity.
                const updateInventoryQuantitySql ="update productinventory set quantity = @newQuantity where productId = @prodId;";
                const updatedInventoryResult = await ord.insertPreparedList(updateInventoryQuantitySql, [{inputName : 'newQuantity', inputType : sql.Int, inputValue : newInventoryQuantity},{inputName : 'prodId', inputType : sql.Int, inputValue : productId}]);
                const insertShipment = await processShipment(req, res);
                res.end();
            
            }

        } catch (err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});
async function processShipment(req,res)
{
    const insertShipmentSql = "insert into shipment(shipmentDate, shipmentDesc, warehouseId) values (@date ,@desc , @wId);";
    const insertShipment = await ord.insertPreparedList(insertShipmentSql, [{inputName : 'date', inputType : sql.Date, inputValue :  new Date()}, {inputName : 'desc', inputType : sql.NVarChar, inputValue : "shipment description."}, {inputName : 'wId', inputType : sql.Int, inputValue : 1}]);
    return insertShipment;
}

module.exports = router;
