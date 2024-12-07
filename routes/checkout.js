const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                background-color: #ffe6f1; 
                color: #333; 
                padding: 20px;
            }
            h1 {
                color: #e6007a;
            }
            form {
                background-color: #ffb3d9;
                padding: 15px;
                border-radius: 10px;
                width: 300px;
                margin: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            label {
                font-size: 16px;
                margin-bottom: 10px;
                display: block;
                color: #e6007a;
            }
            input {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ff66b2;
                border-radius: 5px;
                font-size: 14px;
            }
            button {
                background-color: #ff66b2;
                color: white;
                padding: 10px;
                width: 100%;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
            }
            button:hover {
                background-color: #e6007a;
            }
        </style>
        <title>Grocery CheckOut Line</title>
        
        <h1>Please enter shipment address:</h1>
        <form action="/checkout/shippinginfo" method="POST">
            <label for="shipmentAddress">Shipment Address</label>
            <input type="text" id="shipmentAddress" name="shipmentAddress" min="1" max="5" required>

            <h1>Please enter postal code:</h1>
            <label for="userScore">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" min="1" max="5" required>

            <button type="submit">Submit</button>
        </form>
    `);

    res.end();
});

router.post('/shippinginfo', async function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    let shippingAddress = req.body.shipmentAddress;
    let postalCode = req.body.postalCode;

    req.session.shippingObj = { shippingAddress: shippingAddress, postalCode: postalCode }; // to be used in orders.js

    res.write(`
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                background-color: #ffe6f1; 
                color: #333; 
                padding: 20px;
            }
            h1 {
                color: #e6007a;
            }
            form {
                background-color: #ffb3d9;
                padding: 15px;
                border-radius: 10px;
                width: 300px;
                margin: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            label {
                font-size: 16px;
                margin-bottom: 10px;
                display: block;
                color: #e6007a;
            }
            input {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ff66b2;
                border-radius: 5px;
                font-size: 14px;
            }
            button {
                background-color: #ff66b2;
                color: white;
                padding: 10px;
                width: 100%;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
            }
            button:hover {
                background-color: #e6007a;
            }
        </style>

        <h1>Enter Username:</h1>
        <form action="/checkout/validation" method="POST">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" min="1" max="5" required>

            <h1>Enter Password:</h1>
            <label for="password">Password</label>
            <input type="text" id="password" name="password" min="1" max="5" required>

            <button type="submit">Submit</button>
        </form>
    `);

    res.end();
});

router.post('/validation', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    
    let username = req.session.username;
    let password = req.session.password;

    if (username == req.body.username && password == req.body.password) {
        console.log('Success');
        res.redirect('/order');
        return;
    } else {
        res.redirect('/checkout/shippinginfo');
        return;
    }
});

module.exports = router;
