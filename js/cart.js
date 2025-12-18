// Simple cart system using localStorage
(function () {
  const STORAGE_KEY = "senorito_cart_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (!countEl) return;
    const cart = getCart();
    const total = cart.reduce((s, i) => s + (i.quantity || 0), 0);
    countEl.textContent = total;
  }

  function addToCart(item) {
    const cart = getCart();
    const idx = cart.findIndex((i) => i.id === item.id);
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + (item.quantity || 1);
    } else {
      item.quantity = item.quantity || 1;
      cart.push(item);
    }
    saveCart(cart);
  }

  function formatPrice(p) {
    return (
      p.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "€"
    );
  }

  function renderCartPage() {
    const container = document.getElementById("cart-items");
    if (!container) return;
    const cart = getCart();
    container.innerHTML = "";
    if (cart.length === 0) {
      container.innerHTML = "<p>Votre panier est vide.</p>";
      updateTotals();
      return;
    }

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div class="cart-image"><img src="${item.image || ""}" alt="${
        item.name || ""
      }"></div>
        <div class="cart-name">${item.name}</div>
        <div class="cart-price">${formatPrice(Number(item.price))}</div>
        <div class="cart-qty">
          <button class="qty-decrease" data-id="${item.id}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-increase" data-id="${item.id}">+</button>
        </div>
        <div class="cart-line-total">${formatPrice(
          Number(item.price) * item.quantity
        )}</div>
        <div class="cart-remove"><button class="remove-item" data-id="${
          item.id
        }">Supprimer</button></div>
      `;
      container.appendChild(row);
    });

    // attach listeners
    container.querySelectorAll(".qty-increase").forEach((b) =>
      b.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        changeQty(id, 1);
      })
    );
    container.querySelectorAll(".qty-decrease").forEach((b) =>
      b.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        changeQty(id, -1);
      })
    );
    container.querySelectorAll(".remove-item").forEach((b) =>
      b.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        removeItem(id);
      })
    );

    updateTotals();
  }

  function changeQty(id, delta) {
    const cart = getCart();
    const idx = cart.findIndex((i) => i.id === id);
    if (idx === -1) return;
    cart[idx].quantity = Math.max(0, (cart[idx].quantity || 1) + delta);
    if (cart[idx].quantity === 0) cart.splice(idx, 1);
    saveCart(cart);
    renderCartPage();
  }

  function removeItem(id) {
    const cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    renderCartPage();
  }

  function updateTotals() {
    const totalEl = document.getElementById("cart-total");
    const cart = getCart();
    const total = cart.reduce(
      (s, i) => s + (Number(i.price) || 0) * (i.quantity || 0),
      0
    );
    if (totalEl) totalEl.textContent = formatPrice(total);
    updateCartCount();
  }

  // attach add-to-cart buttons
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          image: btn.dataset.image,
        };
        addToCart(item);
        // simple feedback
        btn.textContent = "Ajouté ✓";
        setTimeout(() => (btn.textContent = "Ajouter au panier"), 1200);
      });
    });

    // render cart page if present
    renderCartPage();
  });

  // expose for page use (optional)
  window.SenoritoCart = { getCart, addToCart, removeItem, changeQty };
})();
