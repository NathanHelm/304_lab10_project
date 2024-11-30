const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const ord = require('./listorder');
let requsername = undefined;
let reqpw = undefined;
router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser)
        {
          //  req.session.loginMessage = "login successful!";
            req.session.authenticatedUser = true;
            req.session.username = requsername;
            req.session.password = req.body.password;
            
            res.redirect("/");
        } else {
            req.session.authenticatedUser = false;
          //  req.session.loginMessage = "username or password is wrong.";
            auth.checkAuthentication(req, res);
            res.redirect("/login");
            
        }
     })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser =  await (async function() {
        try {
             

	// TODO: Check if userId and password match some customer account. 
	// If so, set authenticatedUser to be the username.
            let getCustomerSql = "select * from customer where userid = @userid and password = @userpw;";
            if(username === '' || password === '')
            {
                return false;
            }
            const customerValidationResultSet  = await ord.getPreparedList(getCustomerSql, {userid : username, userpw : password}, [{inputName : 'userid', inputType : sql.NVarChar}, {inputName : 'userpw', inputType : sql.NVarChar}]);
            if(customerValidationResultSet[0].length == 0)
            {
                return false;
            }
            let result = customerValidationResultSet[0][0];
            console.log(result +" "+ result.customerId);
            if(result != null && result.customerId != null)
            {
                console.log(result +" "+ result.customerId);
                requsername = result.userid;
                return true;
            }
        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
