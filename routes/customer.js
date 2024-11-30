const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');
const ord = require('./listorder');

router.get('/', function(req, res, next) {

    res.setHeader('Content-Type', 'text/html');

    // TODO: Print Customer information
    
   if(!auth.checkAuthentication(req, res))
   {
    res.redirect("/login");
    return;
   }
   
   
    (async function() {
        try {
            let username = req.session.username;

            let password = req.session.password;

            if(username == undefined || password == undefined)
            {
                res.redirect("/login");
                return;
            }
            res.write("<h2>customer profile<h2>");
            
            const sqlCustomerProfileString = "select * from customer where userid = @uid and password = @pw;";
            const customerProfileResultSet = await ord.getPreparedList(sqlCustomerProfileString, {uid : username, pw: password}, [{inputName: 'uid', inputType : sql.NVarChar}, {inputName: 'pw', inputType: sql.NVarChar}]);
            
            const columns = ord.getColumns(customerProfileResultSet);
            let result = customerProfileResultSet[0];

            res.write("<table border='1' style='border-collapse: collapse;'>");
            res.write("<tr>");
            for(let i = 0; i < columns.length - 2; i++)
            {
               res.write("<th>"  + columns[i] + "</th>");
            }
            res.write("</tr>");
            res.write("<tr>");
            for(let i = 0; i < result.length; i++)
            {
               res.write("<td>" + result[i].customerId + "</td>");
               res.write("<td>" + result[i].firstName + "</td>");
               res.write("<td>" + result[i].lastName + "</td>");
               res.write("<td>" + result[i].email + "</td>");
               res.write("<td>" + result[i].phonenum + "</td>");
               res.write("<td>" + result[i].address + "</td>");
               res.write("<td>" + result[i].city + "</td>");
               res.write("<td>" + result[i].state + "</td>");
               res.write("<td>" + result[i].postalCode + "</td>");
               res.write("<td>" + result[i].country + "</td>");
            }
            res.write("</tr>");
            res.write("</table>");
            // TODO: Print customer info
            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
