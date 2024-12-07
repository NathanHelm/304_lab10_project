const express = require('express');
const router = express.Router();
const listOrder = require('./listorder');
const sql = require('mssql');

// Add a comment/review
router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    let productId = req.query.productId;
    req.session.productId = productId; // Store product id temporarily. 
    let reviewRating = false;
    let reviewComment = false;

    if (req.session.customerId == undefined) {
        res.redirect('/login');
        res.end();
        return;
    }

    // Start the HTML response with light pink styling
    res.write(`
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #ffe6f0; /* Light pink background */
            color: #333;
          }
          h1, h2 {
            color: #d94e92; /* Darker pink for headings */
            text-align: center;
          }
          form {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            margin: 0 auto;
          }
          label {
            font-size: 16px;
            color: #d94e92; /* Darker pink for labels */
            margin-bottom: 5px;
            display: block;
          }
          input[type="text"], input[type="number"] {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #f7c2d1; /* Light pink border */
            border-radius: 4px;
            font-size: 16px;
          }
          button {
            background-color: #ff80b3; /* Light pink button */
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            font-size: 16px;
          }
          button:hover {
            background-color: #ff66a3; /* Slightly darker pink for hover */
          }
          table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #f7c2d1; /* Light pink border for table rows */
          }
          th {
            background-color: #ffccf2; /* Light pink background for headers */
            color: #d94e92; /* Darker pink for text */
          }
          tr:hover {
            background-color: #ffe6f0; /* Light pink hover effect */
          }
        </style>
      </head>
      <body>
        <h1>Leave a Review!</h1>

        <form action="/comment/submitReview" method="POST">
          <h2>Your Review Message</h2>
          <label for="userInput">Your Review:</label>
          <input type="text" id="userInput" name="userInput" required>

          <h2>Your Score</h2>
          <label for="userScore">Rating (1 to 5):</label>
          <input type="number" id="userScore" name="userScore" min="1" max="5" required>

          <button type="submit">Submit</button>
        </form>

        <h2>Reviews for This Product</h2>
    `);

    // SQL to fetch reviews for this product
    const getreviewForThisProductSql = 'SELECT reviewRating, reviewComment FROM review WHERE productId = @1;';
    const getreviewForThisProduct = await listOrder.getMultipleParamPreparedList(getreviewForThisProductSql, [{ inputName: '1', inputType: sql.Int, inputValue: productId }]);

    if (getreviewForThisProduct[0].length === 0) {
        res.write('<p>No reviews yet for this product.</p>');
        res.end();
        return;
    }

    res.write(`
      <table>
        <thead>
          <tr>
            <th>Review Comment</th>
            <th>User Score</th>
          </tr>
        </thead>
        <tbody>
    `);

    // Loop through the reviews and display them
    for (let i = 0; i < getreviewForThisProduct[0].length; i++) {
        let userRating = getreviewForThisProduct[0][i].reviewRating;
        let userComment = getreviewForThisProduct[0][i].reviewComment;

        res.write(`
          <tr>
            <td>${userComment}</td>
            <td>${userRating}/5</td>
          </tr>
        `);
    }

    res.write(`
        </tbody>
      </table>
    </body>
    </html>
    `);

    res.end();
});

router.post('/submitReview', async function(req, res, next) {
    // Save and submit a review
    let userReview = req.body.userInput;
    let productId = req.session.productId;
    let userScore = req.body.userScore;
    let customerId = req.session.customerId;

    // Max and min for a score
    if (userScore > 5) {
        userScore = 5;
    } else if (userScore < 1) {
        userScore = 1;
    }

    console.log(userReview);
    const insertRevsql = 'INSERT INTO review(reviewRating, reviewDate, customerId, productId, reviewComment) VALUES (@1, @2, @3, @4, @5);';
    await listOrder.insertPreparedList(insertRevsql, [
        { inputName: '1', inputType: sql.Int, inputValue: userScore },
        { inputName: '2', inputType: sql.DateTime, inputValue: new Date() },
        { inputName: '3', inputType: sql.Int, inputValue: customerId },
        { inputName: '4', inputType: sql.Int, inputValue: productId },
        { inputName: '5', inputType: sql.NVarChar, inputValue: userReview }
    ]);

    res.redirect('/listprod');
});

module.exports = router;
