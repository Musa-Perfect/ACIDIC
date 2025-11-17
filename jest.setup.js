// JSDOM setup for DOM APIs used by cart.js
Object.defineProperty(window, 'alert', { value: jest.fn(), writable: true });

// Basic DOM structure used across tests
beforeEach(() => {
  document.body.innerHTML = `
    <div id="cart-sidebar"></div>
    <div id="cart-items"></div>
    <div id="cart-total"></div>
    <div id="checkout-modal"></div>
    <div id="final-total"></div>
    <div id="payment-modal"></div>
    <div id="payment-amount"></div>
    <div id="payment-total"></div>
    <div id="payment-order-items"></div>

    <div id="confirmation-modal"></div>
    <div id="confirmation-order-items"></div>
    <div id="confirmation-total"></div>
    <div id="confirmation-address"></div>
    <div id="rewards-earned-section" style="display:none"></div>
    <div id="points-earned"></div>
    <div id="total-points"></div>
    <div id="tier-progress"></div>

    <input id="size" value="M" />
    <input id="country" value="ZA" />
    <input id="fname" value="John" />
    <input id="lname" value="Doe" />
    <input id="address" value="123 Street" />
    <input id="city" value="Cape Town" />
    <input id="province" value="WC" />
    <input id="postal" value="8001" />
    <input id="phone" value="0123456789" />
    <input id="email" value="john@example.com" />

    <input id="cardholder_name" value="John Doe" />
    <input id="card_number" value="4242424242424242" />
    <input id="expiry_date" value="12/34" />
    <input id="cvv" value="123" />

    <button class="purchase--btn">Pay</button>
  `;
});
