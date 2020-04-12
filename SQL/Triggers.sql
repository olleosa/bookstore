-- will be triggered after an order has been placed
-- makes use of the getMoreStock() function
create trigger checkStock
	after update
	on book
	for each row
	execute function getMoreStock();
