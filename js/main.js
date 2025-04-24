const books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 15.99,
        rating: 4.5,
        image: "images/book1.jpg",
        description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
        category: "Classic"
    },
    // Add more sample books here
];

// DOM Elements
const featuredBooksContainer = document.getElementById('featuredBooksContainer');
const newArrivalsContainer = document.getElementById('newArrivalsContainer');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const cartBadge = document.querySelector('.cart-badge');
const loginModal = document.getElementById('loginModal');

// User state
let currentUser = JSON.parse(localStorage.getItem('user'));
let cartKey = currentUser ? `cart_${currentUser.email}` : null;
let wishlistKey = currentUser ? `wishlist_${currentUser.email}` : null;

// Cart & Wishlist State
let cart = cartKey ? JSON.parse(localStorage.getItem(cartKey)) || [] : [];
let wishlist = wishlistKey ? JSON.parse(localStorage.getItem(wishlistKey)) || [] : [];

updateCartBadge();
updateWishlistCount();

function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        loginBtn.style.display = 'none';
        wishlistBtn.style.display = 'block';
        userMenu.style.display = 'block';
        userName.textContent = currentUser.name;
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        wishlistBtn.style.display = 'none';
        userMenu.style.display = 'none';
        userName.textContent = '';
        logoutBtn.style.display = 'none';
    }
}

function ensureLogin() {
    if (!currentUser) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            cartKey = `cart_${currentUser.email}`;
            wishlistKey = `wishlist_${currentUser.email}`;
            cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
            updateUserUI();
            closeLoginModal();
            showNotification('Successfully logged in!');
            updateCartBadge();
            updateWishlistCount();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error during login', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('user');
    cart = [];
    wishlist = [];
    updateCartBadge();
    updateWishlistCount();
    updateUserUI();
    showNotification('Successfully logged out!');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    loadFeaturedBooks();
    loadNewArrivals();
    setupEventListeners();
});

async function fetchBooks(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

async function loadFeaturedBooks() {
    const books = await fetchBooks('http://localhost:3001/api/books/featured');
    renderBookList(books, featuredBooksContainer);
}

async function loadNewArrivals() {
    const books = await fetchBooks('http://localhost:3001/api/books/new-arrivals');
    renderBookList(books, newArrivalsContainer);
}

function renderBookList(books, container) {
    if (books.length === 0) {
        container.innerHTML = '<p class="text-center">No books available</p>';
        return;
    }
    container.innerHTML = books.map(book => createBookCard(book)).join('');
}

function createBookCard(book) {
    const price = typeof book.price === 'string' ? parseFloat(book.price) : book.price;
    return `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="card book-card">
                <img src="${book.image_url || 'images/placeholder.jpg'}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="author">by ${book.author}</p>
                    <div class="rating">${createRatingStars(book.rating)}</div>
                    <p class="price">$${price.toFixed(2)}</p>
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${book.id})">Add to Cart</button>
                    <button class="btn btn-outline-secondary btn-sm" onclick='addToWishlist(${JSON.stringify(book)})'>
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

async function addToCart(bookId) {
    if (!ensureLogin()) return;

    try {
        const response = await fetch('http://localhost:3001/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, bookId: bookId, quantity: 1 })
        });

        const data = await response.json();

        if (response.ok) {
            const existingItem = cart.find(item => item.bookId === bookId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ bookId, quantity: 1 });
            }
            localStorage.setItem(cartKey, JSON.stringify(cart));
            updateCartBadge();
            alert('Book added to cart!');
        } else {
            showNotification(data.error || 'Failed to add book to cart', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding to cart', 'error');
    }
}

function addToWishlist(book) {
    if (!ensureLogin()) return;

    const alreadyExists = wishlist.some(item => item.id === book.id);
    if (!alreadyExists) {
        wishlist.push({
            id: book.id,
            title: book.title,
            author: book.author,
            image: book.image_url || book.image || 'images/placeholder.jpg'
        });
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        updateWishlistCount();
        alert("Book added to wishlist!");
    } else {
        alert("Book already in wishlist.");
    }
}
window.addToWishlist = addToWishlist;

function updateWishlistCount() {
    const wishlistBadge = document.querySelector('.wishlist-badge');
    if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
    }
}

function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const user = JSON.parse(localStorage.getItem('user'));
        const cartKey = user ? `cart_${user.email}` : null;
        const cart = cartKey ? JSON.parse(localStorage.getItem(cartKey)) || [] : [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

function setupEventListeners() {
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                try {
                    const response = await fetch(`http://localhost:3001/api/books/search?query=${encodeURIComponent(searchTerm)}`);
                    const books = await response.json();
                    displaySearchResults(books);
                } catch (error) {
                    console.error('Error searching books:', error);
                    showNotification('Error searching books', 'error');
                }
            }
        });
    }
}

function displaySearchResults(books) {
    const resultsHtml = books.map(book => createBookCard(book)).join('');
    featuredBooksContainer.innerHTML = `
        <div class="col-12">
            <h3 class="mb-4">Search Results</h3>
        </div>
        ${resultsHtml}
    `;
    document.getElementById('featuredBooks').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1000';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function () {
            window.location.href = 'wishlist.html';
        });
    }
});
