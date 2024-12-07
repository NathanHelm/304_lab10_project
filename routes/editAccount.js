const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require("../auth");

router.get('/', function (req, res) {
    //Checks that user is logged in (authenticated) 
    if (auth.checkAuthentication(req, res)) {
        (async function () {
            let pool = false;
            try {
                const customer = false;
                const username = req.session.authenticatedUser;
                const message = false;

                //Establish connection
                pool = await sql.connect(dbConfig);

                if (req.session.editMessage) {
                    message = req.session.editMessage;
                }

                if (req.session.editUserInfo) {
                    customer = req.session.editUserInfo;
                    req.session.editUserInfo = false;
                } else {
                    const ps = new sql.PreparedStatement(pool);
                    ps.input('userId', sql.VarChar(20));
                    await ps.prepare("SELECT * FROM customer WHERE userid = @userId");
                    const results = await ps.execute({userId: username});
                    customer = results.recordset[0];
                }

                res.render('editAccount',
                    {
                        customer: customer,
                        message: message,
                        title: "Edit Account " + username
                    })
                req.session.editMessage = false
            } catch (err) {
                console.dir(err)
                res.end()
            } finally {
                pool.close()        //eco friendly closing of connection 
            }
        })()
    }
})

//Same as newAccount
router.post('/save', function (req, res) {
    const requiredValues = ['firstName', 'lastName', 'userid', 'password', 'email','phonenum', 'address', 'country', 'city', 'state', 'postalCode'];
    //for each loop to iterate through every input
    for (const userInput of requiredValues) {
        if (!req.body[userInput]) {
            req.session.loginMessage = "Please fill all fields!";
            return false;
        }
    }

    //sets variables as user input
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const userid = req.body.username;
    const email = req.body.email;
    const phonenum = req.body.phonenum;
    const password = req.body.password;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const postalCode = req.body.postalCode;
    const country = req.body.country;

    let customerInput = {
        firstName: firstName,
        lastName: lastName,
        userid: userid,
        email: email,
        phonenum: phonenum,
        password: password,
        address: address,
        city: city,
        state: state,
        postalCode: postalCode,
        country: country,
        customerId: customerId
    };

    const validInput = true;

    (async function () {
        if (email.length > 50 || !/(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/.test(email)) {
            req.session.editMessage = 'There is no way any email making service approved that email. Something is a little wrong';
            validInput = false;
            delete customerInput.email;
            
        } else if (!/[0-9]{3}-[0-9]{3}-[0-9]{4}/.test(phonenum) || phonenum.length > 20) {
            req.session.editMessage = 'That is the weirdest phone number i have ever seen';
            validInput = false;
            delete customerInput.phonenum;

        } else if (!/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.test(postalCode) || postalCode.length > 20) {
            req.session.editMessage = 'Hmm something is wrong with that. Perhaps a map will help';
            validInput = false;
            delete customerInput.postalCode;

        } else if (state.length > 30) {
            req.session.editMessage = 'I see those extra letters';
            validInput = false;
            delete customerInput.state;

        } else if (country.length > 40) {
            req.session.editMessage = "Did you just make up a new country and think I won't notice? I got my pixels on you buddy";
            validInput = false;
            delete customerInput.country;

        } else if (req.session.authenticatedUser !== userid) {  //checks if username has been modified, if it has we must recheck availability
            validInput = await validUserName(req, userid);
            if (!validInput) {
                delete customerInput.userid;
                req.session.customerMessage = "Something went wack. Returning you to Login page";
                res.redirect('/login');
            }
        }

        if (validInput) {
            let pool = false;
            try {
                //Establishing new connection
                pool = await sql.connect(dbConfig);

                const ps = new sql.PreparedStatement(pool);

                //values for pstmt
                ps.input('firstName', sql.VarChar(40));
                ps.input('lastName', sql.VarChar(40));
                ps.input('email', sql.VarChar(50));
                ps.input('phonenum', sql.VarChar(20));
                ps.input('address', sql.VarChar(50));
                ps.input('city', sql.VarChar(40));
                ps.input('state', sql.VarChar(30));
                ps.input('postalCode', sql.VarChar(20));
                ps.input('country', sql.VarChar(40));
                ps.input('userid', sql.VarChar(20));
                ps.input('password', sql.VarChar(30));
                ps.input('customerId', sql.VarChar(30));

                //updates all columns then outputs everything that was added
                await ps.prepare("UPDATE CUSTOMER SET firstName = @firstName, lastName = @lastName, email = @email, phonenum = @phonenum, address = @address, city = @city, state = @state, postalCode = @postalCode, country = @country, userid = @userid, password = @password OUTPUT INSERTED.* WHERE customerId = @customerId");
                
                //waits for pstmt to execute then assigns new values to variables
                let results = await ps.execute({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phonenum: phonenum,
                    address: address,
                    city: city,
                    state: state,
                    postalCode: postalCode,
                    country: country,
                    userid: userid,
                    password: password,
                    customerId: customerId
                })

                //
                const customer = results.recordset[0];

                req.session.authenticatedUser = customer.userid;
                req.session.customerMessage = 'Account successfully updated!';

            } catch (err) {
                res.end();
            } finally {
                pool.close();            //closing connection once again because we are responsible coders
            }
        }

        //if all inputs were valid
        if (validInput) {
            req.session.editMessage = false;
            //redirects back to customer profile once finished
            res.redirect('/customer');
        } else {
            req.session.editUserInfo = customerInput;
            //otherwise they will remain in edit page
            res.redirect('/editAccount');
        }
    })();
});

//if the customer wanted to change username, we would have to check it is available again (same as when they create a new account)
async function validUserName(req, username) {
    let pool = false;
    const validUserName = false;
    try {
        //Establish new connection
        pool = await sql.connect(dbConfig);
        const ps = new sql.PreparedStatement(pool);
        ps.input('userid', sql.VarChar(20));
        await ps.prepare("SELECT userid FROM customer WHERE userid = @userid");

        const result = await ps.execute({userid: username});

        const usernameIsTaken = result.recordset;

        if (usernameIsTaken[0] || username.length > 20) {
            req.session.editMessage = 'Gosh dang it that username is taken';
        } else {
            validUserName = true;
        }

    } catch (err) {
        console.dir(err);
        return false;
    } finally {
        pool.close();                   //bed time closing connection
    }
    return validUserName;
}

module.exports = router;
