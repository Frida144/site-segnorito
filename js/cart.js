// cart.js - Gestion du panier avec localStorage

const CART_KEY = 'senorito_cart_v1';

// Récupérer le panier depuis localStorage
function getCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

// Sauvegarder le panier dans localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Mettre à jour le compteur du panier dans la navbar
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = totalItems;
  }
}

// Ajouter un produit au panier
function addToCart(id, name, price, image) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: parseFloat(price),
      image: image,
      quantity: 1
    });
  }
  
  saveCart(cart);
  
  // Animation de confirmation
  showAddToCartFeedback();
}

// Feedback visuel lors de l'ajout au panier
function showAddToCartFeedback() {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.style.transform = 'scale(1.5)';
    countEl.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      countEl.style.transform = 'scale(1)';
    }, 300);
  }
}

// Supprimer un produit du panier
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

// Mettre à jour la quantité d'un produit
function updateQuantity(id, newQty) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity = Math.max(1, parseInt(newQty) || 1);
    saveCart(cart);
    renderCart();
  }
}

// Formater le prix en euros
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + '€';
}

// Afficher le panier (page panier.html)
function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  
  if (!cartItemsEl || !cartTotalEl) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart-message">
        <p>Votre panier est vide</p>
        <p style="margin-top: 1rem;">
          <a href="epicerie.html" style="color: #28a745; font-weight: 600;">
            Découvrir nos produits →
          </a>
        </p>
      </div>
    `;
    cartTotalEl.textContent = '0,00€';
    return;
  }
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    
    html += `
      <div class="cart-row">
        <div class="cart-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-name">${item.name}</div>
        <div class="cart-price">${formatPrice(item.price)}</div>
        <div class="cart-qty">
          <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
          <input type="number" value="${item.quantity}" min="1" 
                 onchange="updateQuantity('${item.id}', this.value)" />
          <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-line-total">${formatPrice(lineTotal)}</div>
        <div class="cart-remove">
          <button onclick="removeFromCart('${item.id}')">Supprimer</button>
        </div>
      </div>
    `;
  });
  
  cartItemsEl.innerHTML = html;
  cartTotalEl.textContent = formatPrice(total);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  
  // Si on est sur la page panier
  if (document.getElementById('cart-items')) {
    renderCart();
  }
  
  // Attacher les événements aux boutons "Click & collect"
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    // Changer le texte en "Click & collect"
    button.textContent = 'Click & collect';
    
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      const image = btn.dataset.image;
      
      addToCart(id, name, price, image);
      
      // Animation du bouton
      btn.textContent = '✓ Ajouté !';
      btn.style.backgroundColor = '#218838';
      setTimeout(() => {
        btn.textContent = 'Click & collect';
        btn.style.backgroundColor = '#28a745';
      }, 1500);
    });
  });
});