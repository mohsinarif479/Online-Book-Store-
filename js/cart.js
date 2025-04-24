// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

// Retrieve user and use dynamic cart key
const user = JSON.parse(localStorage.getItem('user'));
const cartKey = user ? `cart_${user.email}` : 'cart';
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let cartDetails = [];

// Initialize the cart page
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadCartItems();
    setupEventListeners();
});

// Update Navbar Login/Register or Logout
function updateNavbar() {
    const loginBtn = document.querySelector('.btn-outline-light');
    const registerBtn = document.querySelector('.btn-primary');

    if (user) {
        if (loginBtn) loginBtn.textContent = 'Logout';
        if (registerBtn) registerBtn.style.display = 'none';
        if (loginBtn) loginBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
}

// Load cart items
async function loadCartItems() {
    if (!user) {
        cartItemsContainer.innerHTML = `
            <div class="alert alert-warning">
                <p>Please <a href="login.html">login</a> to view your cart.</p>
            </div>
        `;
        updateOrderSummary(0);
        return;
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="alert alert-info">
                <p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>
            </div>
        `;
        updateOrderSummary(0);
        return;
    }

    try {
        const bookPromises = cart.map(item =>
            fetch(`http://localhost:3001/api/books/${item.bookId}`)
                .then(res => res.json())
                .catch(() => null)
        );

        const books = await Promise.all(bookPromises);
        cartDetails = books
            .map((book, i) => book ? { ...book, quantity: cart[i].quantity } : null)
            .filter(Boolean);

        renderCartItems();
        const subtotal = cartDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
        updateOrderSummary(subtotal);
    } catch (err) {
        console.error('Error loading cart items:', err);
    }
}

// Render cart items
function renderCartItems() {
    if (cartDetails.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="alert alert-info">
                <p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>
            </div>
        `;
        return;
    }

    const cartHTML = cartDetails.map(item => `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-2">
                    <img src="${item.image_url || 'images/placeholder.jpg'}" class="img-fluid rounded-start" alt="${item.title}">
                </div>
                <div class="col-md-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${item.title}</h5>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <p class="card-text">by ${item.author}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${getQuantity(item.id) - 1})">-</button>
                                <span class="mx-2">${getQuantity(item.id)}</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${getQuantity(item.id) + 1})">+</button>
                            </div>
                            <p class="card-text"><strong>$${(item.price * getQuantity(item.id)).toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    cartItemsContainer.innerHTML = cartHTML;
}

function getQuantity(bookId) {
    const item = cart.find(i => i.bookId === bookId);
    return item ? item.quantity : 0;
}

// Update quantity
function updateQuantity(bookId, newQuantity) {
    if (newQuantity < 1) return;

    const index = cart.findIndex(item => item.bookId === bookId);
    if (index !== -1) {
        cart[index].quantity = newQuantity;
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCartItems(); // reload to reflect changes
    }
}

// Remove from cart
function removeFromCart(bookId) {
    cart = cart.filter(item => item.bookId !== bookId);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    loadCartItems();
}

// Update order summary
function updateOrderSummary(subtotal) {
    const shipping = subtotal > 0 ? 5.00 : 0.00;
    const tax = subtotal > 0 ? subtotal * 0.1 : 0.00;
    const total = subtotal + shipping + tax;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Checkout
function setupEventListeners() {
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!user) {
                alert('Please login to proceed to checkout');
                window.location.href = 'login.html';
                return;
            }
            alert('Checkout would proceed here.');
        });
    }
}
