# Bookstore Application

A simple bookstore application with features for browsing, searching, and purchasing books.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a MySQL database and tables:
   - Open MySQL command line or a MySQL client
   - Run the SQL commands in `setup_database.sql`

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`

4. Start the server:
   ```
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:3001
   ```

## Features

- Browse featured books and new arrivals
- Search for books by title, author, or description
- View book details
- Add books to cart
- User authentication (login/register)

## Technologies Used

- Node.js
- Express.js
- MySQL
- HTML/CSS/JavaScript 