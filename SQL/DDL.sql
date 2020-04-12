-- keeps track of individual books
create table book(
	isbn varchar(11),
	title varchar(155) not null,
	authors varchar(1000) not null,
	average_rating numeric(3,2) not null,
	pages numeric(5) not null,
	ratings_count numeric(10) not null,
	publisher varchar(255),
	percent_commission numeric(3,2) not null,
	quantity numeric(2) check (quantity > -1) not null,
	genre varchar(30) not null,
	price numeric(4,2) check (price > 0) not null,
	primary key (isbn),
	foreign key (publisher) references publisher
);

-- keeps track of publishers and their contact info
CREATE TABLE publisher(
  name character varying(1000) not null,
  email character varying(100) not null,
  phone_number character varying(11) not null,
  bank_account character varying(10) not null,
  street_number numeric(5,0) not null,
  street_address character varying(30) not null,
  city character varying(30) not null,
  country character varying(30) not null,
  primary key (name)
);

-- keeps track of all the orders that have been placed
create table ordered(
	tracking_number SERIAL PRIMARY KEY,
	price numeric(5,2) not null,
	order_status varchar(12)
		check (order_status in ('In Warehouse', 'In Transit', 'Delivered')),
	billing_street_number numeric(5,0) not null,
	billing_street_name varchar(100) not null,
	billing_city varchar(30) not null,
	billing_country varchar(30) not null,
	shipping_street_number numeric(5,0) not null,
	shipping_street_name varchar(100) not null,
	shipping_city varchar(30) not null,
	shipping_country varchar(30) not null,
	month numeric(2,0) not null,
	year numeric (4,0) not null
);

-- keeps track of all the people who made an account with the book store
create table users(
	username varchar(20) check length(username > 0),
	password varchar(15) check length(password > 0),
	billing_street_number numeric(5,0) not null,
	billing_street_name varchar(100) not null,
	billing_city varchar(30) not null,
	billing_country varchar(30) not null,
	shipping_street_number numeric(5,0) not null,
	shipping_street_name varchar(100) not null,
	shipping_city varchar(30) not null,
	shipping_country varchar(30) not null,
	primary key (username)
);

-- keeps track of what books are sold and the quantity
create table books_sold(
	tracking_number SERIAL,
	isbn varchar(11) not null,
	quantity numeric (3,0) not null,
	primary key (tracking_number, isbn),
	foreign key (tracking_number) references ordered,
	foreign key (isbn) references book
);

-- keeps track of what orders a customer has placed
create table customer_order(
	tracking_number serial,
	username varchar(20) not null,
	primary key (tracking_number, username),
	foreign key (tracking_number) references ordered,
	foreign key (username) references users
);
