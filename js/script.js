/* ========= Utilities ========= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ========= Loader ========= */
window.addEventListener('load', () => {
  const loader = $('#loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 900);
});

/* ========= Navigation & Search ========= */
const nav = $('#nav');
const menuToggle = $('#menu-toggle') || $('#menu-toggle'); // safe
const menuBtn = $('#menu-toggle') || null;

// mobile nav toggle (opens nav when .mobile-only shown)
const mobileToggle = $('#menu-toggle') || null;
const menuOpenBtn = $('#menu-toggle'); // may be null on desktop

// Fallback: clicking brand links smooth scroll
$$('.nav-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // hide mobile nav if visible
    if (nav.classList.contains('open')) nav.classList.remove('open');
  });
});

// show/hide search overlay
const searchToggle = $('#search-toggle');
const searchOverlay = $('#search-overlay');
const searchClose = $('#search-close');
const searchInput = $('#search-input');

if (searchToggle) {
  searchToggle.addEventListener('click', () => {
    const open = searchOverlay.getAttribute('aria-hidden') === 'false';
    searchOverlay.setAttribute('aria-hidden', String(!open));
    searchOverlay.classList.toggle('open');
    if (!open) setTimeout(() => searchInput.focus(), 120);
  });
}
if (searchClose) {
  searchClose.addEventListener('click', () => {
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOverlay.classList.remove('open');
  });
}

/* ========= Cart (localStorage) ========= */
const CART_KEY = 'hik_cafe_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

const cartOpenBtn = $('#cart-open');
const cartPanel = $('#cart-panel');
const cartCloseBtn = $('#cart-close');
const backdrop = $('#backdrop');
const cartItemsEl = $('#cart-items');
const cartTotalEl = $('#cart-total');
const cartBadge = $('#cart-badge');
const clearCartBtn = $('#clear-cart');
const checkoutBtn = $('#checkout');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderMiniCart();
  renderCartPanel();
}

function getCartCount() {
  return cart.reduce((s, it) => s + it.qty, 0);
}

function updateBadge() {
  cartBadge.textContent = String(getCartCount());
}

// open/close cart panel
function openCart() {
  cartPanel.classList.add('open');
  backdrop.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartPanel.classList.remove('open');
  backdrop.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
}

cartOpenBtn?.addEventListener('click', openCart);
cartCloseBtn?.addEventListener('click', closeCart);
backdrop?.addEventListener('click', closeCart);

// add item
function addToCart({ name, price, img }) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ name, price: Number(price), img, qty: 1 });
  saveCart();
  updateBadge();
  // light animation feedback
  flashButtonFeedback();
}

// quantity change
function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart();
}

// remove item
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateBadge();
}

// compute total
function cartTotal() {
  return cart.reduce((s, it) => s + it.price * it.qty, 0);
}

/* Render cart panel */
function renderCartPanel() {
  cartItemsEl.innerHTML = '';
  if (!cart.length) {
    cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty — add something tasty! 😋</p>`;
  } else {
    cart.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div style="min-width:110px">
          <div style="font-weight:800">${it.name}</div>
          <div style="color:var(--muted); font-size:13px;">$${it.price.toFixed(2)}</div>
        </div>
        <div class="qty-controls">
          <button data-idx="${idx}" data-act="dec">−</button>
          <div style="width:28px;text-align:center">${it.qty}</div>
          <button data-idx="${idx}" data-act="inc">+</button>
          <button data-idx="${idx}" data-act="del" style="margin-left:6px">🗑</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
  }
  cartTotalEl.textContent = `$${cartTotal().toFixed(2)}`;
  updateBadge();
}

/* Render mini-cart on order panel */
function renderMiniCart() {
  const mini = $('#mini-cart');
  const miniTotal = $('#mini-total');
  mini.innerHTML = '';
  if (!cart.length) mini.innerHTML = `<div style="color:var(--muted)">Cart empty</div>`;
  else {
    cart.forEach(it => {
      const r = document.createElement('div');
      r.className = 'mini-row';
      r.innerHTML = `<img src="${it.img}" alt="${it.name}"><div style="flex:1"><strong style="display:block">${it.name}</strong><small style="color:var(--muted)">$${it.price.toFixed(2)} × ${it.qty}</small></div>`;
      mini.appendChild(r);
    });
  }
  miniTotal.textContent = `$${cartTotal().toFixed(2)}`;
}

/* attach click handlers for qty buttons inside cart panel */
cartItemsEl?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const act = btn.dataset.act;
  if (act === 'inc') changeQty(idx, 1);
  else if (act === 'dec') changeQty(idx, -1);
  else if (act === 'del') removeItem(idx);
  saveCart();
  renderCartPanel();
  renderMiniCart();
});

/* clear cart and checkout */
clearCartBtn?.addEventListener('click', () => {
  if (!confirm('Clear your cart?')) return;
  cart = [];
  saveCart();
  updateBadge();
});
checkoutBtn?.addEventListener('click', () => {
  if (!cart.length) { alert('Your cart is empty.'); return; }
  alert('✅ Order placed! Thank you.'); // Hook to real checkout later
  cart = [];
  saveCart();
  updateBadge();
  closeCart();
});

/* flash feedback */
function flashButtonFeedback() {
  const bd = document.body;
  bd.style.transition = 'box-shadow .2s';
  bd.style.boxShadow = 'inset 0 0 120px rgba(10,90,60,0.08)';
  setTimeout(() => bd.style.boxShadow = '', 220);
}

/* wire up "Add" buttons from menu */
$$('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);
    const img = btn.dataset.img;
    addToCart({ name, price, img });
  });
});

/* init cart UI */
renderCartPanel();
renderMiniCart();
updateBadge();

/* ========= Menu filter & search ========= */
const chips = $$('.chip');
const cards = $$('.card');
const menuSearch = $('#menu-search');

function filterMenu(cat) {
  cards.forEach(c => {
    const ok = (cat === 'all' || c.dataset.category === cat);
    c.style.display = ok ? '' : 'none';
  });
}
chips.forEach(ch => {
  ch.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    filterMenu(ch.dataset.filter);
  });
});

menuSearch?.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  cards.forEach(c => {
    const txt = c.textContent.toLowerCase();
    c.style.display = txt.includes(q) ? '' : 'none';
  });
});

/* header mobile show */
const mobileMenuBtn = $('#menu-toggle') || $('#menu-toggle'); // may be null depending markup
const menuToggleBtn = $('#menu-toggle') || $('.mobile-only');
const navBtn = $('#menu-toggle');
/* basic mobile nav behaviour */
const smallMenuBtn = document.querySelector('.mobile-only');
if (smallMenuBtn) {
  smallMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

/* ========= Order form ========= */
const orderForm = $('#order-form');
orderForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!cart.length) return alert('Please add items to cart first 😊');
  const fd = new FormData(orderForm);
  const name = fd.get('name');
  alert(`Thanks ${name}! Your order request has been received. We'll contact you soon.`);
  // reset
  cart = [];
  saveCart();
  updateBadge();
  renderCartPanel();
  renderMiniCart();
  orderForm.reset();
});

/* "Order From Cart" quick button */
$('#order-cart')?.addEventListener('click', () => {
  if (!cart.length) return alert('Cart empty — add something yummy first 😋');
  const orderFormEl = $('#order-form');
  orderFormEl.querySelector('[name="notes"]').value = 'Ordering items from cart';
  orderFormEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ========= Small UX: highlight active nav on scroll ========= */
const sections = $$('main > section, main > header, main > footer');
const navLinks = $$('.nav-link');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 140;
  navLinks.forEach(a => a.classList.remove('active'));
  $('.nav-link[href="#home"]')?.classList.remove('active');
  for (let sec of $$('.section, .hero')) {
    const id = sec.id;
    if (!id) continue;
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
      const link = $(`.nav-link[href="#${id}"]`);
      if (link) link.classList.add('active');
    }
  }
});

/* ========= Footer Year ========= */
$('#year').textContent = new Date().getFullYear();
