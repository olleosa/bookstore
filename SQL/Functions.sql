--function to see if we need to get more stock, and adding stock if needed
--will be used as the body of a trigger function
create or replace function getMoreStock()
returns trigger as
$$
begin
	if book.quantity < 5 then
    -- when the month is Jan, the previous month is Dec of previous year
		if (select (extract(month from current_date) - 1) = 0) then
      -- getting the amount of books sold for the previous month
			with r as
			(select books_sold.isbn, sum(books_sold.quantity) as rnd
			from books_sold, ordered, book
			where ordered.tracking_number = books_sold.tracking_number
			 and books_sold.isbn = book_isbn
			 and ordered.month = 11
			 and ordered.year = (select (extract(year from current_date) - 1))
			group by books_sold.isbn)

      -- update book with the amount sold in the previous month
			update book
			set book.quantity = book.quantity + r.rnd
			from r
			where r.isbn = book.isbn and book.quantity < 5;

    -- Jan is not the current month
		else
      -- getting the amount of books sold for the previous month
			with r as
			(select books_sold.isbn, sum(books_sold.quantity) as rnd
			from books_sold, ordered, book
			where ordered.tracking_number = books_sold.tracking_number
			 and books_sold.isbn = book_isbn
			 and ordered.month = (select (extract(month from current_date) - 2))
			 and ordered.year = (select (extract(year from current_date)))
			group by books_sold.isbn)

      -- updating the books according to how much they sold in the previous month
			update book
			set book.quantity = book.quantity + r.rnd
			from r
			where r.isbn = book.isbn and book.quantity < 5;
      
		end if;
	end if;
end;
$$
language plpgsql;


--called when the user places an order
--inserts new values into ordered, customer_order, books_sold
create or replace procedure placingOrder(float, varchar, int, varchar, varchar, varchar, int,
										 varchar, varchar, varchar, int, int, varchar, varchar)
language plpgsql
as $$
declare
	ele varchar;
	books TEXT[] := string_to_array($14, ','); --splitting a string of isbns into an array so we can iterate through them
begin
	INSERT INTO ordered VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12); -- adding into ordered
	INSERT INTO customer_order SELECT MAX(tracking_number), $13 FROM ordered; -- adding into customer_order

	-- adding books into books_sold
	foreach ele in array books loop
		if ele in (select isbn from books_sold where tracking_number = (select max(tracking_number) from ordered)) then
			update books_sold
			set quantity = quantity + 1
			where tracking_number = (select max(tracking_number) from ordered);
		else
			insert into books_sold(tracking_number, isbn, quantity)
			select max(tracking_number), ele, 1
			from ordered;
		end if;

    -- update the quantity values for each book
		update book
		set quantity = quantity - 1
		where isbn = ele;

	end loop;
end;
$$
