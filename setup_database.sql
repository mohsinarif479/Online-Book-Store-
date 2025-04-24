-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bookstore;

-- Use the database
USE bookstore;

-- Create the books table if it doesn't exist
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample books
INSERT INTO books (title, author, price, description, image_url, is_featured) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 15.99, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'images/book1.jpg', TRUE),
('To Kill a Mockingbird', 'Harper Lee', 12.99, 'The story of racial injustice and the loss of innocence in the American South.', 'images/book2.jpg', TRUE),
('1984', 'George Orwell', 14.99, 'A dystopian social science fiction novel and cautionary tale.', 'images/book3.jpg', TRUE),
('Pride and Prejudice', 'Jane Austen', 11.99, 'A romantic novel of manners that satirizes 19th century society.', 'images/book4.jpg', TRUE),
('The Catcher in the Rye', 'J.D. Salinger', 13.99, 'A story of teenage alienation and loss of innocence.', 'images/book5.jpg', FALSE),
('The Hobbit', 'J.R.R. Tolkien', 16.99, 'A fantasy novel about the adventures of Bilbo Baggins.', 'images/book6.jpg', FALSE),
('Brave New World', 'Aldous Huxley', 15.99, 'A dystopian social science fiction novel.', 'images/book7.jpg', FALSE),
('The Lord of the Rings', 'J.R.R. Tolkien', 24.99, 'An epic high-fantasy novel.', 'images/book8.jpg', FALSE); 