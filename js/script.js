// ===== Utilities =====
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// ===== Mobile Nav =====
const menuBtn = $('#menu-btn');
const navbar = $('#navbar');
menuBtn.addEventListener('click', () => {
  navbar.classList.toggle('open');
});

// Close mobile nav when clicking a link
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => navbar.classList.remove('open'));
});

// Highlight active nav link on scroll
const sections = $$('section');
const navLinks = $$('.nav-link');
const onScroll = () => {
  const pos = window.scrollY + 140;
  sections.forEach(sec => {
    if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = $(`.nav-link[href="#${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
};
window.addEventListener('scroll', onScroll);

// ===== Cart State =====
const CART_KEY = 'hik_cafe_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

// Elements
const cartBtn = $('#cart-btn');
const cartPanel = $('#cart-panel');
const cartBackdrop = $('#cart-backdrop');
const closeCart = $('#close-cart');
const cartItemsEl = $('#cart-items');
const cartTotalEl = $('#cart-total');
const cartCountEl = $('#cart-count');
const checkoutBtn = $('#checkout-btn');
const clearCartBtn = $('#clear-cart-btn');

// Open/Close Cart
const openCart = () => {
  cartPanel.classList.add('open');
  cartBackdrop.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
};
const closeCartPanel = () => {
  cartPanel.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
};
cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartPanel);
cartBackdrop.addEventListener('click', closeCartPanel);

// Render Cart
function renderCart(){
  if (!cart.length){
    cartItemsEl.innerHTML = `<p style="color:#6b7280">Your cart is empty. Add some tasty items from the menu.</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="meta">
          <div class="name">${item.name}</div>
          <div class="price">$${(item.price * item.qty).toFixed(2)} <span style="color:#9ca3af">($${item.price.toFixed(2)} × ${item.qty})</span></div>
        </div>
        <div class="qty">
          <button aria-label="Decrease" data-act="dec" data-idx="${idx}">−</button>
          <span>${item.qty}</span>
          <button aria-label="Increase" data-act="inc" data-idx="${idx}">+</button>
          <button aria-label="Remove" data-act="del" data-idx="${idx}" title="Remove" style="margin-left:6px">🗑</button>
        </div>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  cartTotalEl.textContent = `$${total.toFixed(2)}`;

  const count = cart.reduce((sum, it) => sum + it.qty, 0);
  cartCountEl.textContent = String(count);
}
renderCart();

// Cart actions
cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const idx = Number(btn.dataset.idx);
  const act = btn.dataset.act;

  if (Number.isNaN(idx) || !cart[idx]) return;

  if (act === 'inc') cart[idx].qty += 1;
  if (act === 'dec') cart[idx].qty = Math.max(1, cart[idx].qty - 1);
  if (act === 'del') cart.splice(idx, 1);

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
});

// Add to cart from menu
$$('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const img = btn.dataset.img;

    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, img, qty: 1 });

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
    openCart();
  });
});

// Checkout
checkoutBtn.addEventListener('click', () => {
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }
  alert('✅ Order placed! Thank you.');
  cart = [];
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
  closeCartPanel();
});

// Clear cart
clearCartBtn.addEventListener('click', () => {
  if (confirm('Clear all items from cart?')) {
    cart = [];
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
});

// ===== Order Form =====
const orderForm = $('#order-form');
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(orderForm);
  const name = data.get('name');
  alert(`🎉 Thanks, ${name}! Your order request has been received.`);
  orderForm.reset();
});

// ===== Footer Year =====
$('#year').textContent = new Date().getFullYear();
