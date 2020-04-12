const express = require('express');
const path = require('path');
const { Pool, Client } = require("pg");
const connectionString = "postgresql://user:password@localhost:3000/project-3005";
const pool = new Pool({
  connectionString: connectionString,
})
const client = new Client({
  connectionString: connectionString,
})

let app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

client.connect();
console.log("Client is connected to the server!");

//get routes
app.get('/', landingPage);
app.get('/owner', isOwner);
app.get('/getGenres', getGenres);

//post routes
app.post('/getUser', checkUser);
app.post('/newUser', addUser);
app.post('/salesReport', getReport);
app.post('/salesReport2', getReport2);
app.post('/addBook', addBook);
app.post('/deleteBook', deleteBook);
app.post('/searchBooks', queryBooks);
app.post('/placeOrder', placeOrder);
app.post('/userOrders', userOrders);

//default page
function landingPage(req, res, next){
  console.log("Landing Page");
  res.sendFile(path.join(__dirname+'/public/pages/landing_page.html'));
}

//check if user is in the database
function checkUser(req, res, next){
  console.log(req.body);
  let query = {
    name: 'getUser',
    text: 'SELECT * FROM users WHERE username = $1 AND password = $2;',
    values: [req.body.username, req.body.password],
  }
  client.query(query, (err, result)=> {
    if (err){
      return;
    }else{
      console.log(result.rows);
      res.send(result.rows) //send to the client
    }
  })
}

//if the user is the ower
function isOwner(req, res, next){
  console.log("Owner Page");
  res.status(200).sendFile(path.join(__dirname+"/public/pages/owner_page.html"));
}

//get all the genres possible for books
function getGenres(req, res, next){
  let query = {
    name: 'getGenres',
    text: 'SELECT DISTINCT(genre) FROM book',
  }
  client.query(query, (err, result) => {
    if (err){
      return;
    }else{
      res.send(result.rows);
    }
  })
}

//add a user to the database
function addUser(req, res, next){
  console.log(req.body);
  let query = {
    name: 'addUser',
    text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
    values: [req.body.username, req.body.password, req.body.bStreetNo, req.body.bStreet,
      req.body.bCity, req.body.bCountry, req.body.sStreetNo, req.body.sStreet, req.body.sCity,
      req.body.sCountry],
  }
  client.query(query, (err, result) => {
    if (err){
      return;
    }else{
      console.log("Added user to database");
      req.send("Success!");
    }
  })
}

//query some books for the search function
function queryBooks(req, res, next){
  console.log(req.body);
  if (req.body.search.length == 0 && req.body.genre == 'none'){
    let query = {
      name: 'findBooks1',
      text: 'SELECT * FROM book;'
    }
    client.query(query, (err, result) => {
      if (err){
        return;
      }else{
        res.send(result.rows);
      }
    })
  }else if(req.body.search.length == 0){
    let query = {
      name: 'findBooks2',
      text: 'SELECT * FROM book WHERE genre = $1;',
      values: [req.body.genre],
    }
    client.query(query, (err, result) => {
      if (err){
        return;
      }else{
        res.send(result.rows);
      }
    })
  }else if(req.body.genre == 'none'){
    if(req.body.category == 'title'){
      let query = {
        name: 'findBooks3',
        text: 'SELECT * FROM book WHERE title ILIKE $1 or title ILIKE $2 or title ILIKE $3;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%'],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }else if(req.body.category == 'author'){
      let query = {
        name: 'findBook4',
        text: 'SELECT * FROM book WHERE authors ILIKE $1 or authors ILIKE $2 or authors ILIKE $3;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%'],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }else{
      let query = {
        name: 'findBooks5',
        text: 'SELECT * FROM book WHERE isbn ILIKE $1 or isbn ILIKE $2 or isbn ILIKE $3;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%'],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }
  }else{ //both genre and search
    if (req.body.category == 'title'){
      let query = {
        name: 'findBooks6',
        text: 'SELECT * FROM book WHERE (title ILIKE $1 or title ILIKE $2 or title ILIKE $3) and genre = $4;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%', req.body.genre],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }else if(req.body.category == 'author'){
      let query = {
        name: 'findBooks7',
        text: 'SELECT * FROM book WHERE (authors ILIKE $1 or authors ILIKE $2 or authors ILIKE $3) and genre = $4;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%', req.body.genre],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }else{
      let query = {
        name: 'findBooks8',
        text: 'SELECT * FROM book WHERE (isbn ILIKE $1 or isbn ILIKE $2 or isbn ILIKE $3) and genre = $4;',
        values: ['%'+req.body.search+'%', '%'+req.body.search, req.body.search+'%', req.body.genre],
      }
      client.query(query, (err, result) => {
        if (err){
          return;
        }else{
          res.send(result.rows);
        }
      })
    }
  }
}

//placing orders -- inserting into database
function placeOrder(req, res, next){
  console.log(req.body);

  let query = {
    name: 'placeOrder',
    text: "call placingOrder($1, $2::varchar, $3, $4::varchar, $5::varchar, $6::varchar, $7, $8::varchar, $9::varchar, $10::varchar, $11, $12, $13::varchar, $14::varchar);",
    values: [req.body.price, 'In Warehouse', req.body.info[0], req.body.info[1],
    req.body.info[2], req.body.info[3], req.body.info[4], req.body.info[5],
    req.body.info[6], req.body.info[7], req.body.month, req.body.year, req.body.user, req.body.cart.toString()],
  }

  client.query(query, (err, result) => {
    if(err){
      console.log(err);
    }else{
      console.log("successfully placed order");
      res.status(200).send();
    }
  })
}

//getting all of a users' orders from database
function userOrders(req, res, next){
  console.log(req.body);

  let query = {
    name: 'getOrders',
    text: 'SELECT tracking_number, price, order_status FROM ordered WHERE tracking_number in (SELECT tracking_number FROM customer_order WHERE username = $1);',
    values: [req.body.user],
  }

  client.query(query, (err, result) => {
    if (err){
      console.log(err);
    }else{
      console.log("getting customer orders");
      res.send(result.rows);
    }
  })
}

//adding book to database
function addBook(req, res, next){
  console.log(req.body);

  let query = {
    name: 'addBook',
    text: 'INSERT INTO book VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);',
    values: [req.body.isbn, req.body.title, req.body.authors, req.body.rating,
      req.body.pages, req.body.numRatings, req.body.publisher, req.body.percent,
      req.body.quantity, req.body.genre, req.body.price],
  }

  client.query(query, (err, result) => {
    if(err){
      return;
    }else{
      console.log("Added book to database");
    }
  })
}

//deleting book from database
function deleteBook(req, res, next){
  console.log(req.body);

  let query = {
    name: 'deleteBook',
    text: 'DELETE FROM book WHERE isbn = $1;',
    values: [req.body.isbn],
  }

  client.query(query, (err, result) => {
    if(err){
      return;
    }else {
      console.log("Deleted book from database");
    }
  })
}

//getting total sales from database
function getReport(req, res, next){
  console.log(req.body);
  let query = {
    name: 'report',
    text: 'SELECT SUM(price) FROM ordered WHERE ordered.month = $1 and ordered.year = $2',
    values: [req.body.month, req.body.year],
  }
  client.query(query, (err, result) => {
    if(err){
      console.log(err);
    }else{
      res.send(result.rows[0]);
    }
  })
}

//getting filtered sales from database
function getReport2(req, res, next){
  console.log(req.body);
  if (req.body.filter == 'genre'){
    let query = {
      name: "sales1",
      text: 'SELECT genre as filtered, books_sold.isbn, SUM(books_sold.quantity) FROM book, books_sold, ordered WHERE book.isbn = books_sold.isbn and ordered.tracking_number = books_sold.tracking_number and ordered.month = $1 and ordered.year = $2 GROUP BY genre, books_sold.isbn;',
      values: [req.body.month, req.body.year],
    }
    client.query(query, (err, result) => {
      if(err){
        console.log(err);
      }else{
        res.send(result.rows);
      }
    })
  }else if (req.body.filter == 'authors'){
    let query = {
      name: "sales2",
      text: 'SELECT authors as filtered, books_sold.isbn, SUM(books_sold.quantity) FROM book, books_sold, ordered WHERE book.isbn = books_sold.isbn and ordered.tracking_number = books_sold.tracking_number and ordered.month = $1 and ordered.year = $2 GROUP BY authors, books_sold.isbn;',
      values: [req.body.month, req.body.year],
    }
    client.query(query, (err, result) => {
      if(err){
        console.log(err);
      }else{
        res.send(result.rows);
      }
    })
  }else if (req.body.filter == 'city'){
    let query = {
      name: "sales3",
      text: 'SELECT billing_city as filtered, books_sold.isbn, SUM(books_sold.quantity) FROM book, books_sold, ordered WHERE book.isbn = books_sold.isbn and ordered.tracking_number = books_sold.tracking_number and ordered.month = $1 and ordered.year = $2 GROUP BY billing_city, books_sold.isbn;',
      values: [req.body.month, req.body.year],
    }
    client.query(query, (err, result) => {
      if(err){
        console.log(err);
      }else{
        res.send(result.rows);
      }
    })
  }else{
    let query = {
      name: "sales4",
      text: 'SELECT billing_country as filtered, books_sold.isbn, SUM(books_sold.quantity) FROM book, books_sold, ordered WHERE book.isbn = books_sold.isbn and ordered.tracking_number = books_sold.tracking_number and ordered.month = $1 and ordered.year = $2 GROUP BY billing_country, books_sold.isbn;',
      values: [req.body.month, req.body.year],
    }
    client.query(query, (err, result) => {
      if(err){
        console.log(err);
      }else{
        res.send(result.rows);
      }
    })
  }
}

app.listen(3001);
