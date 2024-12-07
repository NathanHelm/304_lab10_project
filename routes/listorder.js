const express = require('express');
const router = express.Router(); // creates new router object that handles request.
const sql = require('mssql');
const moment = require('moment');

router.get('/', function (req, res, next) { //middle ware example
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>YOUR NAME Grocery Order List</title>');
    res.write("<style>");
    res.write("body { font-family: 'Courier New', monospace; }");
    res.write("table { border: 1px solid black; border-collapse: collapse; border-radius: 10px; font-family: 'Courier New', monospace; }");
    res.write("th, td { border: 1px solid black; padding: 5px; font-family: 'Courier New', monospace; }"); // Apply Arial font to table headers and cells

    res.write("</style>");


    const sqlQ = "select ord.orderId, ord.orderDate, cust.customerId, cust.firstName as customer_name from orders.dbo.ordersummary as ord join orders.dbo.customer as cust on ord.customerId = cust.customerId;";


    res.write("<body>");


    getList(sqlQ).then(async result => {
        console.log(result)
        res.write("<table border='1' style='border-collapse: collapse;'>");
        const columns = getColumns(result);
        res.write("<tr>");
        for (let i = 0; i < columns.length; i++) {
            res.write("<th>" + columns[i] + "</th>"); //list columns
        }
        res.write("</tr>");
        let orders = result[0];
        for (let i = 0; i < orders.length; i++) {

           
            let orderId = orders[i].orderId;
            let orderDate = orders[i].orderDate;
            let customerId = orders[i].customerId;
            let customer_name = orders[i].customer_name;

            res.write("<tr>");
            res.write("<td> " + orderId + " </td>");
            res.write("<td> " + orderDate + " </td>");
            res.write("<td> " + customerId + " </td>");
            res.write("<td> " + customer_name + " </td>");
            res.write("</tr>");

            const productSql = "select prod.productId, op.quantity, prod.productPrice from orders.dbo.product as prod join orders.dbo.orderproduct as op on op.productId = prod.productId where op.orderId = @otherorderId ;"; //join product with orderproduct
        try{
            const result2 = await getPreparedList(productSql, { otherorderId: orderId }, [{ inputName: 'otherorderId', inputType: sql.Int }]);
            

            const columns = getColumns(result2);
            res.write("<tr>");
            for (let j = 0; j < columns.length; j++) {
                res.write("<th>" + columns[j] + "</th>"); //list columns
            }
            res.write("</tr>");

            let products = result2[0];
           


            for (let k = 0; k < products.length; k++){

                res.write("<tr>");
                let productId = products[k].productId;
                let quantity = products[k].quantity;
                let productPrice = products[k].productPrice;

                res.write("<td>" + productId + "</td>");
                res.write("<td>" + quantity + "</td>");
                res.write("<td>" + productPrice + "</td>");
                res.write("</tr>");
            }
    
            
         
        } catch(error)
        {
            console.error(error);
        }
        }
        res.write("</table>");
        res.end();
    });

    res.write("</body>");


});

async function insertPreparedList(sqlInsert, inputObject)
{
    try {
        let pool = await sql.connect(dbConfig); //get global connection
        let ps = pool.request();
        for (let i = 0; i < inputObject.length; i++) {
            ps.input(inputObject[i].inputName, inputObject[i].inputType, inputObject[i].inputValue);
           // ps.input()
        }
  
        let result = await ps.query(sqlInsert);
         
        pool.close();
        return result.recordsets;
    }
    catch (error)
    {
        console.log(error);
    }
}

async function insertList(sqlInsert)
{
    try {
        let pool = await sql.connect(dbConfig); //get global connection
        let ps = pool.request();
        let result = await ps.query(sqlInsert);
        pool.close();
        return result.recordsets;
    }
    catch (error)
    {
        console.log(error);
    }
}

async function getList(sqlString) {
    try {
        let pool = await sql.connect(dbConfig); //get global connection
        let result = await pool.request().query(sqlString);
        return result.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}


async function getPreparedList(sqlString, preparedListParameterObj, inputObject) {
    try {
        let pool = await sql.connect(dbConfig); //get global connection
        let ps = new sql.PreparedStatement(pool);
        for (let i = 0; i < inputObject.length; i++) {
            ps.input(inputObject[i].inputName, inputObject[i].inputType);
        }
        await ps.prepare(sqlString);

        let result = await ps.execute(preparedListParameterObj);
        //await ps.unprepare();
        pool.close();
        return result.recordsets;
    }
    /* example: 
    inputObj: [
    {name:"Ford", models:["Fiesta", "Focus", "Mustang"]},
    {inputName:"inputNameExample", inputType:"inputTypeExample"}
    ]
    */
    catch (error) {
        console.log(error);
    }
}


async function getMultipleParamPreparedList(sqlString, inputObject){

try {
    let pool = await sql.connect(dbConfig); //get global connection
    let request = new sql.Request();
    for (let i = 0; i < inputObject.length; i++) {
        request.input(inputObject[i].inputName, inputObject[i].inputType, inputObject[i].inputValue);
    }

    let result = await request.query(sqlString);
    //await ps.unprepare();
    pool.close();
    return result.recordsets;
}
catch (error) {
    console.log(error);
}
}



function getColumns(result) {
    return Object.keys(result[0].columns);
}
module.exports = {getPreparedList, getList, getColumns, insertPreparedList, insertList,router, getMultipleParamPreparedList};

