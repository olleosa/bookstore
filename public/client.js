//variables to keep track of what the user is doing
let user;
let cart = [];
let cartBookNames = [];
let prices = [];
let totalPrice = 0;

/**************************************************************
 *                                                            *
 *      Functions used by both the user and the owner         *
 *                                                            *
 **************************************************************/

//verifying the login information
function login(){
 console.log("Login attempted");
 let username = document.getElementById("usernameTb").value.trim();
 let password = document.getElementById("passwordTb").value.trim();

 //verifying things are entered
 if (username.length == 0){
   alert("Please input a username!");
   return;
 }else if (password.length == 0){
   alert("Please input a password!");
   return;
 }

 //if user is the owner
 if (username == "owner" && password == "password"){
   window.location.href = "http://localhost:3001/owner"

 //if not the owner
 }else {

   let req = new XMLHttpRequest();
   req.onreadystatechange = function(){

     if (this.status == 200 && this.readyState == 4){
       console.log(JSON.parse(this.response));

       //if there is a matching user
       if (JSON.parse(this.response).length != 0){
         alert("You have successfully logged in!");
         user = username;
         getGenres();
         document.getElementById("loginInfo").style.display = "none";
         document.getElementById("loggedIn").style.display = "block";
         document.getElementById("signUpInfo").style.display = "none";
         document.getElementById("findingBooks").style.display= "block";
       }else{
         alert("The username was not found or the password was incorrect");
       }
     }
   }
   req.open("POST", "./getUser");
   req.setRequestHeader('Content-type', 'application/json');
   req.send(JSON.stringify({username: username, password: password}));
 }
}

/**************************************************************
 *                                                            *
 *                 Functions used by the user                 *
 *                                                            *
 **************************************************************/

//signing out of their account
function signOut(){
 console.log("signing out")
 document.getElementById("loginInfo").style.display = "block";
 document.getElementById("signUpInfo").style.display = "inline-block";
 document.getElementById("loggedIn").style.display = "none";
 document.getElementById("findingBooks").style.display = "none";
 //resetting all values
 user = null;
 cart = [];
 cartBookNames = [];
 prices = [];
 totalPrice = 0;
}

//signing up for a new account
function signUp(){
  console.log("Sign up clicked");
  //variables
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value.trim();

  let billStrNo = parseInt(document.getElementById("newBillStrNo").value.trim(), 10);
  let billStr = document.getElementById("newBillStrName").value.trim();
  let billCity = document.getElementById("newBillCity").value.trim();
  let billCountry = document.getElementById("newBillCountry").value.trim();

  let shipStrNo = parseInt(document.getElementById("newShipStrNo").value.trim(), 10);
  let shipStr = document.getElementById("newShipStrName").value.trim();
  let shipCity = document.getElementById("newShipCity").value.trim();
  let shipCountry = document.getElementById("newShipCountry").value.trim();

  //put into list for easier validation checking
  let info = [username, password, billStrNo, billStr, billCity, billCountry, shipStrNo, shipStr, shipCity, shipCountry];

  //checking if all are valid
  for (let i = 0; i < info.length; i++){
    if (info[i].length == 0){
      alert("You did not enter all the information needed!");
      return;
    }
  }

  //insert new account into database
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      alert("You have successfully signed up to be a member of Look Inna Book!");
    }
  }
  req.open("POST", "./newUser");
  req.setRequestHeader('Content-type', 'application/json');
  req.send(JSON.stringify({username: username, password: password,
    bStreetNo: billStrNo, bStreet: billStr, bCity: billCity,
    bCountry: billCountry, sStreetNo: shipStrNo, sStreet: shipStr,
    sCity: shipCity, sCountry: shipCountry}));
}

//searching for books
function search(){
  console.log("search attempted");
  let search = document.getElementById("searchbar").value.trim();
  let category = document.getElementById("searchOptions").options[document.getElementById("searchOptions").selectedIndex].value;
  let genre = document.getElementById("genres").options[document.getElementById("genres").selectedIndex].value;

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      let query = JSON.parse(this.response);
      let prevQuery = document.getElementById("queryResults");

      //removing old query
      while(prevQuery.firstChild){
        prevQuery.removeChild(prevQuery.lastChild);
      }

      //adding new query to html
      for (let i = 0; i < query.length; i++){
        let title = document.createElement("p");
        let button = document.createElement("button");
        title.innerHTML = '<b>' + query[i].title + '</b> by ' + query[i].authors + '<br>';
        title.innerHTML += 'Rating: ' + query[i].average_rating + '   (' + query[i].ratings_count + ' votes)' + '<br>';
        title.innerHTML += 'Published by: ' + query[i].publisher + '<br>' + 'Pages: ' + query[i].pages + '<br>' + 'Genre: ' + query[i].genre + '<br>';
        title.innerHTML += '$' + query[i].price + '<br>';

        button.innerHTML = "Add to Cart";
        button.id = query[i].isbn;
        button.onclick = function(){
          addToCart(query[i].isbn, query[i].title, query[i].price);
        }
        title.appendChild(button);
        prevQuery.appendChild(title);
      }
      prevQuery.style.display = "block";
    }
  }
  req.open("POST", "./searchBooks");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify({search: search, genre:genre, category: category}));
}

//displays the user's basket of books
function openCart(){
  console.log(cart);
  totalPrice = 0;
  let area = document.getElementById("cartItems");

  //removing old cart
  while(area.firstChild){
    area.removeChild(area.lastChild);
  }

  //adding elements
  for (let i = 0; i < cart.length; i++){
    let current = document.getElementById(cart[i]);
    let item = document.createElement("p");
    let button = document.createElement("button");
    item.innerHTML += "<b>" + cartBookNames[i] + "</b> $" + prices[i]+"<br>";

    button.innerHTML = "Remove Book";
    button.onclick = function(){
      deleteFromCart(current.id);
    }
    item.appendChild(button);
    area.appendChild(item);
    totalPrice += parseFloat(prices[i]);
  }

  //adding total price to display
  let price = document.createElement("p");
  price.innerHTML = "Total: <b>$" + totalPrice + "</b>";
  area.appendChild(price);

  document.getElementById("cart").style.display = "block";
}

//adding elements to the cart
function addToCart(isbn, title, price){
  cart.push(isbn);
  cartBookNames.push(title);
  prices.push(price);
  alert("You have successfully added the book to your cart");
}

//deleted books from the cart
function deleteFromCart(isbn){
  let index = cart.indexOf(isbn);
  if (index != -1){
    //deleting book from cart arrays
    cart.splice(index, 1);
    cartBookNames.splice(index, 1);

    //adjusting prices
    document.getElementById("cartItems").removeChild(document.getElementById("cartItems").childNodes[cart.length + 1]);
    totalPrice = (totalPrice - prices[index]).toFixed(2);
    prices.splice(index, 1);
    let price = document.createElement("p");
    price.innerHTML = "Total: <b>$" + totalPrice + "</b>";
    document.getElementById("cartItems").appendChild(price);

    //deleting the element that needs to be deleted
    document.getElementById("cartItems").removeChild(document.getElementById("cartItems").childNodes[index]);
  }else{
    alert("Unable to remove the book.");
  }
}

//heading to check out with the cart
function checkOut(){
  if (totalPrice == 0){
    alert("You don't have anything in your cart!");
    return;
  }
  document.getElementById("cart").style.display = "none";
  document.getElementById("checkOut").style.display = "block";
  document.getElementById("orders").style.display = "none";
}

//placing an order and putting it into the database
function placeOrder(){
  //variables needed
  let sNo = parseInt(document.getElementById("shipStrNo").value.trim(),10);
  let sStr = document.getElementById("shipStrName").value.trim();
  let sCity = document.getElementById("shipCity").value.trim();
  let sCountry = document.getElementById("shipCountry").value.trim();

  let bNo = parseInt(document.getElementById("billStrNo").value.trim(),10);
  let bStr = document.getElementById("billStrName").value.trim();
  let bCity = document.getElementById("billCity").value.trim();
  let bCountry = document.getElementById("billCountry").value.trim();

  closeModal();

  //check if all values have been filled out
  let values = [bNo, bStr, bCity, bCountry, sNo, sStr, sCity, sCountry];
  for (let i = 0; i < values.length; i++){
    if (values[i].length == 0 ){
      alert("You did not fill out all the fields!");
      return;
    }
  }

  let d = new Date();

  //send POST req to server
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      cart = [];
      cartBookNames = [];
      prices = [];
      totalPrice = 0;
      alert("You have successfully placed an order with Look Inna Book!");
    }
  }
  req.open("POST", "./placeOrder");
  req.setRequestHeader('Content-type', 'application/json');
  req.send(JSON.stringify({price: totalPrice, info: values, month: d.getMonth(),
    year: d.getFullYear(), user: user, cart: cart}));
}

//showing the user all their orders and their status
function showOrders(){
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      console.log(JSON.parse(this.response));
      let orders = JSON.parse(this.response);

      //removing old query
      while(document.getElementById("userOrders").firstChild){
        document.getElementById("userOrders").removeChild(document.getElementById("userOrders").lastChild);
      }

      //show modal for order
      for(let i = 0; i < orders.length; i++){
        let order = document.createElement("p");
        order.innerHTML = "Tracking Number: " + orders[i].tracking_number + "<br>";
        order.innerHTML += "Status: " + orders[i].order_status + "<br>";
        order.innerHTML += "Cost: " + orders[i].price + "<br><br>";

        document.getElementById("userOrders").appendChild(order);
      }
      document.getElementById("orders").style.display = "block";
    }
  }
  req.open("POST", "./userOrders");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify({user:user}));
}

/**************************************************************
 *                                                            *
 *                 Functions used by the owner                *
 *                                                            *
 **************************************************************/

//signing out
function signOutOwner(){
  window.location.href = "http://localhost:3001"
}

//adding a book to the database
function addBook(){
  let isbn = document.getElementById("isbn").value.trim();
  let title = document.getElementById("title").value.trim();
  let authors = document.getElementById("authors").value.trim();
  let rating = parseFloat(document.getElementById("avgRating").value.trim());
  let pages = parseInt(document.getElementById("pages").values.trim(), 10);
  let numRatings = parseInt(document.getElementById("numRatings").value.trim(), 10);
  let publisher = document.getElementById("publisher").value.trim();
  let percent = parseFloat(document.getElementById("commissionPercent").value.trim());
  let quantity = parseInt(document.getElementById("quantity").value.trim(), 10);
  let genre = document.getElementById("genre").value.trim();
  let price = parseFloat(document.getElementById("price").value.trim());

  //checking if all valid
  let values = [isbn, title, authors, rating, pages, numRatings, publisher, percent, quantity, genre, price];
  for (let i = 0; i < values.length; i++){
    if (values.length == 0){
      alert("You did not complete the required fields!");
      return;
    }
  }
  //send a req to the server
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      console.log(JSON.parse(this.response));
      alert("Successfully added the book to the store!");
    }
  }
  req.open("POST", "./addBook");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify({isbn:isbn, title: title, authors: authors, rating: rating,
    pages:pages, numRatings: numRatings, publisher: publisher,
    percent: percent, quantity: quantity, genre: genre, price: price}));
}

//deleting a book from the database
function deleteBook(){
  let isbn = document.getElementById("del_ISBN").value.trim();

  if (isbn.length == 0){
    alert("You did not enter an ISBN value");
    return;
  }

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      alert("Successfully deleted the book from the store");
    }
  }
  req.open("POST", "./deleteBook");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify({isbn: isbn}));
}

//getting total sales
function getSalesReport(){
  let year = document.getElementById("yearly").options[document.getElementById("yearly").selectedIndex].value;
  let month = document.getElementById("monthly").options[document.getElementById("monthly").selectedIndex].value;
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      let queryPrice = JSON.parse(this.response);

      //removing old query
      while(document.getElementById("salesReport").firstChild){
        document.getElementById("salesReport").removeChild(document.getElementById("salesReport").lastChild);
      }

      let p = document.createElement("p");
      p.innerHTML = "Total Sales: $" + queryPrice.sum + "<br>";
      p.innerHTML += "Total Expenses: $" + parseFloat(queryPrice.sum) * 0.5 + "<br>";
      document.getElementById("salesReport").appendChild(p);

      getSalesReport2();
    }
  }
  req.open("POST", "./salesReport");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify({year: year, month:month}));
}

//filtering the sales by the selected filter value (genre, author, city, country)
function getSalesReport2(){
  let values = {};

  let year = document.getElementById("yearly").options[document.getElementById("yearly").selectedIndex].value;
  let month = document.getElementById("monthly").options[document.getElementById("monthly").selectedIndex].value;
  let filters = document.getElementsByName("filter");
  values.year = parseInt(year, 10);
  values.month = parseInt(month, 10);

  //see which filter value has been checked off
  for (let i = 0; i < filters.length; i++){
    if (filters[i].checked == true){
      values.filter = filters[i].value;
      break;
    }
  }

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      let report = JSON.parse(this.response);
      let reportElements = {}

      //adding up all the elements depending on the filtered element
      for (let i = 0; i < report.length; i++){
        if (report[i].filtered in reportElements){
          reportElements[report[i].filtered] += parseInt(report[i].sum, 10);
        }else{
          reportElements[report[i].filtered] = parseInt(report[i].sum,10);
        }
      }
      //showing all the elements
      let entries = Object.entries(reportElements);
      for (let i = 0; i < entries.length; i++){
        let ele = document.createElement("p");
        ele.innerHTML = entries[i][0] + ": " + entries[i][1] + " books sold<br>";
        document.getElementById("salesReport").appendChild(ele);
      }
    }
  }
  req.open("POST", "./salesReport2");
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify(values));
}

/**************************************************************
 *                                                            *
 *                       Helper Functions                     *
 *                                                            *
 **************************************************************/

//getting all the genres from the database
function getGenres(){
  console.log("generating genres");

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if (this.status == 200 && this.readyState == 4){
      console.log(JSON.parse(this.response));
      let genres = JSON.parse(this.response);

      //put genres into the select
      for (let i = 0; i < genres.length; i++){
        let option = document.createElement("OPTION");
        option.innerHTML = genres[i].genre;
        option.value = genres[i].genre;
        document.getElementById("genres").options.add(option);
      }
    }
  }
  req.open("GET", "./getGenres");
  req.setRequestHeader('Content-type', 'application/json');
  req.send();
}

//show deleting book html
function showDeleteBook(){
  document.getElementById("generateSalesReport").style.display="none";
  document.getElementById("addBook").style.display="none";
  document.getElementById("delBook").style.display="block";
}

//show add book html
function showAddBook(){
  document.getElementById("generateSalesReport").style.display="none";
  document.getElementById("addBook").style.display="block";
  document.getElementById("delBook").style.display="none";
}

//show sales report html
function showSalesReport(){
  document.getElementById("generateSalesReport").style.display="block";
  document.getElementById("addBook").style.display="none";
  document.getElementById("delBook").style.display="none";
}

//close modals
function closeModal(){
  document.getElementById("cart").style.display = "none";
  document.getElementById("checkOut").style.display = "none";
  document.getElementById("orders").style.display = "none";
}
