// ==========================================================================
// ZAFAZ V2.0 // Modern Aesthetic Theme & Commerce Initialized.
// ==========================================================================

// 1. Smooth Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 2. Dynamic Section Highlighting on Scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// ==========================================================================
// FITUR: THEME TOGGLE (DARK / LIGHT MODE)
// ==========================================================================
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌓';
        }
    });
}

// ==========================================================================
// FITUR: SIZE GUIDE MODAL
// ==========================================================================
const openSizeBtn = document.getElementById('open-size-guide');
const closeSizeBtn = document.querySelector('.close-modal');
const sizeModal = document.getElementById('size-modal');

if (openSizeBtn && sizeModal) {
    openSizeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sizeModal.classList.add('active');
    });

    if (closeSizeBtn) {
        closeSizeBtn.addEventListener('click', () => {
            sizeModal.classList.remove('active');
        });
    }

    sizeModal.addEventListener('click', (e) => {
        if (e.target === sizeModal) {
            sizeModal.classList.remove('active');
        }
    });
}

// ==========================================================================
// SECURITY LAYER 1: HARGA RESMI DIKUNCI DI JAVASCRIPT (ANTI-MANIPULASI HTML)
// ==========================================================================
const MASTER_PRODUCT_PRICE = {
    "1": 75000,   // ID 1 (Kaos Distro Skatepark) harganya dikunci Rp 75.000
    "2": 120000,  // Contoh ID 2 jika ada produk baru nanti
};

// ==========================================================================
// FITUR: SELEKSI UKURAN, KERANJANG BELANJA & INTEGRASI WHATSAPP
// ==========================================================================
const nomorAdmin = "6285721446979"; 
let cart = [];
let isCheckoutLocked = false; // Anti-Spam Tracker

const cartTrigger = document.getElementById('cart-trigger');
const cartPanel = document.getElementById('cart-panel');
const closeCartBtn = document.getElementById('close-cart');
const cartCountElement = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const checkoutWaBtn = document.getElementById('checkout-wa-btn');

if (cartTrigger) cartTrigger.addEventListener('click', () => cartPanel.classList.add('active'));
if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));

const allSizeButtons = document.querySelectorAll('.size-btn');
allSizeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const parentOptions = e.target.closest('.size-options');
        parentOptions.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
    });
});

const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');

        // SECURITY CHECK: COCOKKAN HARGA HTML DENGAN MASTER PRICE JS
        const htmlPrice = parseInt(card.getAttribute('data-price')) || 0;
        const officialPrice = MASTER_PRODUCT_PRICE[id];

        if (officialPrice === undefined || htmlPrice !== officialPrice) {
            alert('Sistem mendeteksi adanya manipulasi data produk. Sesi dibatalkan.');
            console.error('Security Warning: HTML Price does not match System Price Master.');
            return;
        }

        const selectedSizeBtn = card.querySelector('.size-btn.selected');
        if (!selectedSizeBtn) {
            alert('Silakan pilih ukuran (S, M, L, XL) terlebih dahulu!');
            return;
        }

        const size = selectedSizeBtn.getAttribute('data-size');
        addToCart(id, name, officialPrice, size);
        
        if (cartPanel) cartPanel.classList.add('active');
    });
});

function addToCart(id, name, price, size) {
    const cartItemId = `${id}-${size}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ cartItemId, id, name, price, size, quantity: 1 });
    }
    updateCartUI();
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartUI();
}
window.removeFromCart = removeFromCart;

function updateCartUI() {
    if (!cartCountElement || !cartItemsContainer || !cartTotalPriceElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Keranjang Anda kosong.</p>';
        cartTotalPriceElement.textContent = 'Rp 0';
        return;
    }

    let totalHarga = 0;
    cart.forEach(item => {
        totalHarga += item.price * item.quantity;
        
        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-item');
        itemRow.innerHTML = `
            <div class="item-info">
                <h4>${item.name} (${item.size})</h4>
                <p>${item.quantity}x - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</p>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.cartItemId}')">Hapus</button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });

    cartTotalPriceElement.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
}

// ==========================================================================
// SECURITY LAYER 2: DEBOUNCING / ANTI-SPAM CLICK FLOODING PADA CHECKOUT
// ==========================================================================
if (checkoutWaBtn) {
    checkoutWaBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang Anda masih kosong!');
            return;
        }

        if (isCheckoutLocked) {
            alert('Mohon tunggu beberapa detik sebelum melakukan checkout kembali.');
            return;
        }

        // Kunci tombol checkout selama 3 detik
        isCheckoutLocked = true;
        checkoutWaBtn.style.opacity = "0.5";
        checkoutWaBtn.innerText = "Processing...";

        setTimeout(() => {
            isCheckoutLocked = false;
            checkoutWaBtn.style.opacity = "1";
            checkoutWaBtn.innerText = "Order via WhatsApp";
        }, 3000);

        let teksPesan = `Halo ZAFAZ, saya ingin memesan produk berikut:\n\n`;
        let totalAkhir = 0;

        cart.forEach((item, index) => {
            teksPesan += `${index + 1}. *${item.name}* [Size ${item.size}] (${item.quantity} pcs) -> Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
            totalAkhir += item.price * item.quantity;
        });

        teksPesan += `\n*Total Keseluruhan:* Rp ${totalAkhir.toLocaleString('id-ID')}\n\nMohon info ketersediaan stok & format ordernya ya min. Terima kasih!`;

        const urlWhatsApp = `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(teksPesan)}`;
        window.open(urlWhatsApp, '_blank');
    });
}

// ==========================================================================
// SECURITY LAYER 3: BASIC SOURCE CODE OBFUSCATION & INTERCEPT DELAY
// ==========================================================================
// Matikan Klik Kanan
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Blokir Shortcut Keyboard Inspect Element (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.addEventListener('keydown', (e) => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
        alert('Fitur pengembang dinonaktifkan demi keamanan portofolio ZAFAZ.');
    }
});

console.log("ZAFAZ V2.0 // Security Firewall & Integrity Check Active.");
