const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const ord = require('./listorder');

router.get('/', function(req, res, next) {

	
	// TODO: Include files auth.jsp and jdbc.jsp
	if(!auth.checkAuthentication(req, res))
    {
        res.redirect("/login");
    }
	
	
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            const sqlString = "select orderDate, sum(totalAmount) as 'Total Order Amount' from ordersummary group by orderDate order by orderDate asc;";
            const adminResult = await ord.getList(sqlString);
            const column = ord.getColumns(adminResult);
            const result = adminResult[0];
            res.write("<table border='1' style='border-collapse: collapse;'>");
            res.write("<tr>");
            for(let i = 0; i < column.length; i++)
            {
               res.write("<th>" + column[i] + "</th>");
            }
            res.write("</tr>");
            
            for(let i = 0; i < result.length; i++)
            {
               res.write("<tr>");
               res.write("<td>" + result[i].orderDate + "</td>");
               res.write("<td>" + result[i]['Total Order Amount'] + "</td>");
               res.write("</tr>");
            }
           
            res.write("</table>")
            res.end();

	    // TODO: Write SQL query that prints out total order amount by day
        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
    

});

module.exports = router;