
-- getting genres to set up the html dropdown when searching for books
-- returns list of all the genres possible in the bookstore
SELECT DISTINCT(genre) FROM book;

-- checking to see if the user and password are in the database
-- used for verifying and logging in a user
-- should return nothing if user and password cannot be found
-- should return 1 row if the user can be found
SELECT * FROM users WHERE username = 'username' AND password = 'password';

-- adding a user to the database
-- used when a user decides to sign up for an account
INSERT INTO users
VALUES('username', 'password', 223, 'billing street name', 'billing city', 'billing country',
23, 'shipping street name', 'shipping city', 'shipping country');

-- if the user does not specify a genre or types anything into the search bar
-- used when searching for books in the bookstore
-- returns a list of all the books in the store
SELECT * FROM book;

-- if the user specifies a genre but does not type anything into the search bar
-- used when searching for books in the bookstore
-- returns a list of all the books with a certain genre in the store
SELECT * FROM book WHERE genre = 'Dystopia';

-- if the user does not specify a genre but searches for a title of a book
-- used when searching for books in the book store
-- returns a list of all the books that are similar to the search query
-- ignores case
SELECT * FROM book
WHERE title ILIKE '%title%' or title ILIKE '%title' or title ILIKE 'title%';

-- if user does not specifiy a genre but searches for an author of a book
-- used when searching for books in the book store
-- returns a list of all the books that are written by an author that is similar to the search query
-- ignores case
SELECT * FROM book
WHERE authors ILIKE '%authors%' or authors ILIKE '%authors' or authors ILIKE 'authors%';


-- if user does not specifiy a genre but searches for the isbn of a book
-- used when searching for books in the book store
-- returns a list of all the books have an isbn that is similar to the search query
-- ignores case
SELECT * FROM book
WHERE isbn ILIKE '%isbn%' or isbn ILIKE '%isbn' or isbn ILIKE 'isbn%';

-- if user specifies genre and searches for title of a book
-- used when searching for books in the book store
-- returns list of all books with certain genre and similar title to search query
SELECT * FROM book
WHERE (title ILIKE '%title%' or title ILIKE '%title' or title ILIKE 'title%') and genre = 'Romance';

-- if user specifies genre and searches for author of a book
-- used when searching for books in the book store
-- returns list of all books with certain genre and similar author to search query
SELECT * FROM book
WHERE (authors ILIKE '%authors%' or authors ILIKE '%authors' or authors ILIKE 'authors%') and genre = 'Romance';

-- if user specifies genre and searches for isbn of a book
-- used when searching for books in the book store
-- returns list of all books with certain genre and similar isbn to search query
SELECT * FROM book
WHERE (isbn ILIKE '%isbn%' or isbn ILIKE '%isbn' or isbn ILIKE 'isbn%') and genre = 'Romance';

-- used when a user places an order
-- calls the placingOrder() function
-- inserts data into 3 entities - ordered, customer_order, books_sold
call placingOrder(price, 'In Warehouse'::varchar, 23, 'billing street'::varchar,
  'billing city'::varchar, 'billing country'::varchar, 31, 'shipping street'::varchar,
  'shipping city'::varchar, 'shipping country'::varchar, 1, 2020, 'username'::varchar, 'isbn, isbn, isbn, isbn'::varchar);

-- getting all the ordered placed by the user
-- returns rows tracking_number, price, order_status
-- used when the user wants to see the status of their orders
SELECT tracking_number, price, order_status
FROM ordered
WHERE tracking_number in
(SELECT tracking_number FROM customer_order WHERE username = 'username');

-- adding a book into the database
-- used by the owner of the bookstore
INSERT INTO book
VALUES('isbn', 'title', 'authors', 2.50, 178, 12398,'publisher', 0.23, 100, 'genre', 12.43);

-- delete a book from the database using the isbn
-- used by the owner of the bookstore
DELETE FROM book
WHERE isbn = '1239083';

-- get total sales from database based on certain month and year
-- used by owner when generating a sales report
SELECT SUM(price)
FROM ordered
WHERE ordered.month = 2 and ordered.year = 2020;

-- get total sales by genre
-- used by owner when generating a sales report
SELECT genre as filtered, books_sold.isbn, SUM(books_sold.quantity)
FROM book, books_sold, ordered
WHERE book.isbn = books_sold.isbn
AND ordered.tracking_number = books_sold.tracking_number
AND ordered.month = 2
AND ordered.year = 2020
GROUP BY genre, books_sold.isbn;

-- get total sales by authors
-- used by owner when generating a sales report
SELECT authors as filtered, books_sold.isbn, SUM(books_sold.quantity)
FROM book, books_sold, ordered
WHERE book.isbn = books_sold.isbn
AND ordered.tracking_number = books_sold.tracking_number
AND ordered.month = 2
AND ordered.year = 2020
GROUP BY authors, books_sold.isbn;

-- get total sales by city
-- used by owner when generating a sales report
SELECT billing_city as filtered, books_sold.isbn, SUM(books_sold.quantity)
FROM book, books_sold, ordered
WHERE book.isbn = books_sold.isbn
AND ordered.tracking_number = books_sold.tracking_number
AND ordered.month = 2
AND ordered.year = 2020
GROUP BY billing_city, books_sold.isbn;

-- get total sales by country
-- used by owner when generating a sales report
SELECT billing_country as filtered, books_sold.isbn, SUM(books_sold.quantity)
FROM book, books_sold, ordered
WHERE book.isbn = books_sold.isbn
AND ordered.tracking_number = books_sold.tracking_number
AND ordered.month = 2
AND ordered.year = 2020
GROUP BY billing_country, books_sold.isbn;
