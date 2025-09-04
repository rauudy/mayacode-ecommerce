
// Sistema de carrito de compras
let cart = [];

function addToCart(productName, price, id) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    updateCartUI();
    showCartNotification(productName);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutTotal = document.getElementById('checkoutTotal');

    // Actualizar el recuento de carritos
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Actualizar la visualización de los elementos del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tu carrito está vacío</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p>Q${item.price.toLocaleString()}</p>
                        </div>
                        <div class="item-controls">
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span style="margin: 0 1rem; font-weight: bold;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                            <button onclick="removeFromCart('${item.id}')" style="background: #ff4757; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-left: 1rem;">Eliminar</button>
                        </div>
                    </div>
                `).join('');
    }

    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: Q${total.toLocaleString()}`;
    if (checkoutTotal) {
        checkoutTotal.textContent = `Total a Pagar: Q${total.toLocaleString()}`;
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function showCartNotification(productName) {
    // Notificación sencilla
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                z-index: 3000;
                animation: slideIn 0.3s ease;
            `;
    notification.innerHTML = `✓ ${productName} agregado al carrito`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    toggleCart();
    document.getElementById('checkoutSection').style.display = 'block';
    document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
    updateCartUI(); // Actualizar total de pago
}

function processOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    // Generar número de orden único
    const orderNumber = 'MC' + Date.now().toString().slice(-8);
    document.getElementById('orderNumber').textContent = orderNumber;

    // Mostrar mensaje de éxito
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });

    // tienda 
    const orderData = {
        orderNumber: orderNumber,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        customerInfo: new FormData(document.getElementById('checkoutForm'))
    };

    console.log('Orden procesada (simulación):', orderData);
}

function resetStore() {
    cart = [];
    updateCartUI();
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('checkoutForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// desplazamiento suave para enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// cerrar modal del carrito al hacer clic fuera
document.getElementById('cartModal').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleCart();
    }
});

// Agregar css para animaciones
const style = document.createElement('style');
style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

// Inicializa el carrito al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    updateCartUI();
});

// Manejar la selección del método de pago para mostrar/ocultar campos de tarjeta
document.addEventListener('DOMContentLoaded', function () {
    const metodoPago = document.querySelector('select[name="metodoPago"]');
    const cardFields = document.querySelectorAll('input[name="numeroTarjeta"], input[name="cvv"], select[name="mesVencimiento"], select[name="anoVencimiento"]');

    if (metodoPago) {
        metodoPago.addEventListener('change', function () {
            const isCard = this.value === 'tarjeta';
            cardFields.forEach(field => {
                field.parentElement.style.display = isCard ? 'block' : 'none';
                field.required = isCard;
            });
        });
    }
});

// Agregar animación de carga para finalizar la compra
function showLoading() {
    const button = document.querySelector('button[type="submit"]');
    button.innerHTML = 'Procesando... ⏳';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = 'Completar Compra (Simulación)';
        button.disabled = false;
    }, 2000);
}

// Actualizar el envío del formulario para incluir la carga
document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    showLoading();
    setTimeout(() => {
        processOrder(e);
    }, 2000);
});
