const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve files from root directory

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookstore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
    });

// Routes

// Get featured books
app.get('/api/books/featured', async (req, res) => {
    try {
        const [books] = await pool.query('SELECT * FROM books WHERE is_featured = 1 LIMIT 4');
        console.log('Featured books:', books); // Debug log
        res.json(books);
    } catch (error) {
        console.error('Error fetching featured books:', error);
        res.status(500).json({ error: 'Error fetching featured books' });
    }
});

// Get new arrivals
app.get('/api/books/new-arrivals', async (req, res) => {
    try {
        const [books] = await pool.query('SELECT * FROM books ORDER BY created_at DESC LIMIT 4');
        console.log('New arrivals:', books); // Debug log
        res.json(books);
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        res.status(500).json({ error: 'Error fetching new arrivals' });
    }
});

// Search books
app.get('/api/books/search', async (req, res) => {
    try {
        const { query } = req.query;
        const searchTerm = `%${query}%`;
        const [books] = await pool.query(
            'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        res.json(books);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Error searching books' });
    }
});

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const [books] = await pool.query('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Error fetching books' });
    }
});

// Get a single book by ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (books.length === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        res.json(books[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Error fetching book' });
    }
});

// User authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // First, check if the user exists
        const [users] = await pool.query(
            'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (users.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = users[0];
        
        // Try to get the role if it exists
        try {
            const [roleResult] = await pool.query(
                'SELECT role FROM users WHERE id = ?',
                [user.id]
            );
            
            if (roleResult.length > 0 && roleResult[0].role) {
                user.role = roleResult[0].role;
            } else {
                user.role = 'user'; // Default role if not found
            }
        } catch (error) {
            console.log('Role column might not exist yet, using default role');
            user.role = 'user'; // Default role if there's an error
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});

// User registration
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    
    pool.getConnection()
        .then(connection => {
            connection.query(query, [name, email, password])
                .then(result => {
                    res.json({ message: 'User registered successfully', userId: result.insertId });
                })
                .catch(err => {
                    console.error('Error registering user:', err);
                    res.status(500).json({ error: 'Error registering user' });
                });
            connection.release();
        })
        .catch(err => {
            console.error('Error connecting to database:', err);
            res.status(500).json({ error: 'Error connecting to database' });
        });
});

// Shopping cart operations
app.post('/api/cart/add', (req, res) => {
    const { userId, bookId, quantity } = req.body;
    const query = 'INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)';
    
    pool.getConnection()
        .then(connection => {
            connection.query(query, [userId, bookId, quantity])
                .then(result => {
                    res.json({ message: 'Item added to cart', cartItemId: result.insertId });
                })
                .catch(err => {
                    console.error('Error adding item to cart:', err);
                    res.status(500).json({ error: 'Error adding item to cart' });
                });
            connection.release();
        })
        .catch(err => {
            console.error('Error connecting to database:', err);
            res.status(500).json({ error: 'Error connecting to database' });
        });
});

// Get user's cart
app.get('/api/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT c.*, b.title, b.price, b.image 
        FROM cart_items c 
        JOIN books b ON c.book_id = b.id 
        WHERE c.user_id = ?
    `;
    
    pool.getConnection()
        .then(connection => {
            connection.query(query, [userId])
                .then(results => {
                    res.json(results);
                })
                .catch(err => {
                    console.error('Error fetching cart:', err);
                    res.status(500).json({ error: 'Error fetching cart' });
                });
            connection.release();
        })
        .catch(err => {
            console.error('Error connecting to database:', err);
            res.status(500).json({ error: 'Error connecting to database' });
        });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 