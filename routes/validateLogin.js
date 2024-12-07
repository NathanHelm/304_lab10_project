const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const ord = require('./listorder');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.

    (async () => {
        const authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.loginMessage = "Login successful!";
            req.session.authenticatedUser = true;
            req.session.username = req.body.username;
            req.session.password = req.body.password;
            res.redirect("/customer");
        } else {
            req.session.authenticatedUser = false;
            req.session.loginMessage = "Incorrect ussername or password :(";
            auth.checkAuthentication(req, res);
            res.redirect("/login");
        }
     })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    const username = req.body.username;
    const password = req.body.password;
    const authenticatedUser =  await (async function() {      //async func waits for validation
        // Checks if username and password match a customer account. 
	    // If so, set authenticatedUser to be the username.
        try {
            //IMPORTANT!! @userid and @userpw avoids sql injection attacks!!
            let getCustomerSql = "select userid, password, customerId, adminStatus from customer where userid = @userid collate Latin1_General_CS_AS and password = @userpw collate Latin1_General_CS_AS";
            //NOTE: collate specifies rules for comparing data
            //Latin1_General refers to english-based rules
            //CS ensures value is case-sensitive

            //No login if blank
            if (username === '' || password === '') {
                return false;
            }

            //Runs sql query from above
            const customerValidationResultSet  = await ord.getPreparedList(getCustomerSql, {userid : username, userpw : password}, [{inputName : 'userid', inputType : sql.NVarChar}, {inputName : 'userpw', inputType : sql.NVarChar}]);
            
            //Empty customers database (no accounts have been created)
            if (customerValidationResultSet[0][0].length == 0) {
                return false;
            }

            //Only checks index 0 since userid are unique and only one row will be returned if a match is found
            const result = customerValidationResultSet[0][0];
            
            //Stores/saves user credentials and can be accessed later as long as user is signed in
            if (result != null && result.customerId != null) {
                req.session.customerId = result.customerId;
                req.session.adminStatus = result.adminStatus;
                return true;
            } else {
                req.session.loginMessage = "Login info is invalid. You can do it, please try again";
                return false;
            }

        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
