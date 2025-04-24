document.addEventListener('DOMContentLoaded', function () {
    updateWishlistCount();
    loadWishlistItems();
    updateCartBadge();
});

function getUserKey(type) {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? `${type}_${user.email}` : null;
}

function loadWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items');
    const wishlistKey = getUserKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    if (!wishlistContainer) return; // Prevent error if element doesn't exist

    wishlistContainer.innerHTML = ''; // Clear previous content

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
    } else {
        wishlist.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('col-md-4', 'mb-4');
            itemDiv.innerHTML = `
                <div class="card">
                    <img src="${item.image || 'images/placeholder.jpg'}" class="card-img-top" style="height: 300px; object-fit: cover;" alt="${item.title || 'No Title'}">
                    <div class="card-body">
                        <h5 class="card-title">${item.title || 'No Title'}</h5>
                        <p class="card-text">${item.author || 'Unknown Author'}</p>
                        <button class="btn btn-danger remove-from-wishlist" data-book-id="${item.id}">Remove</button>
                    </div>
                </div>
            `;
            wishlistContainer.appendChild(itemDiv);
        });

        // Add remove button functionality
        const removeButtons = document.querySelectorAll('.remove-from-wishlist');
        removeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const bookId = this.getAttribute('data-book-id');
                removeFromWishlist(bookId);
            });
        });
    }
}

function removeFromWishlist(bookId) {
    const wishlistKey = getUserKey('wishlist');
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    wishlist = wishlist.filter(item => item.id !== parseInt(bookId));
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    loadWishlistItems();
    updateWishlistCount();
}

function updateWishlistCount() {
    const badge = document.querySelector('.wishlist-count');
    const wishlistKey = getUserKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    if (badge) badge.textContent = wishlist.length;
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const cartKey = getUserKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}
