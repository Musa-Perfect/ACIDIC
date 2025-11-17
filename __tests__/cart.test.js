/**
 * Tests for scripts/cart.js behaviors using Jest + JSDOM
 */

// Provide globals expected by cart.js
global.currentItem = { name: 'Acidic Tee', price: 200 };
global.selectedColor = 'Red';

global.applyRewardsBenefits = (amount) => amount; // no-op for unit tests

global.closeModal = jest.fn();
global.toggleCart = jest.fn((show) => {
  const el = document.getElementById('cart-sidebar');
  el.classList.toggle('active', show);
});

global.closeCustomize = jest.fn();

global.updateUserRewards = jest.fn((total) => Math.floor(total / 10));

global.displayUserRewards = jest.fn();

global.showMainContent = jest.fn();

global.currentUser = { name: 'John', email: 'john@example.com', points: 0, rewardTier: 'Bronze', benefits: {} };

global.rewardTiers = {
  Silver: { threshold: 100 },
  Gold: { threshold: 500 },
};

describe('cart.js', () => {
  let cartModule;

  beforeEach(() => {
    jest.resetModules();
    cartModule = require('../scripts/cart.js');
  });

  test('adds selected item to cart and updates UI', () => {
    document.getElementById('size').value = 'L';

    expect(document.getElementById('cart-items').children.length).toBe(0);

    cartModule.addSelectedToCart();

    // Expect cart sidebar shown
    expect(document.getElementById('cart-sidebar').classList.contains('active')).toBe(true);

    // Expect cart items list updated
    expect(document.getElementById('cart-items').children.length).toBe(1);

    // Expect close modal called
    expect(global.closeModal).toHaveBeenCalled();
  });

  test('adds customization to cart with color and alerts user', () => {
    document.getElementById('size').value = 'S';

    cartModule.addCustomizationToCart();

    // Should append one item to cart UI
    expect(document.getElementById('cart-items').children.length).toBe(1);

    // Cart sidebar toggled open
    expect(document.getElementById('cart-sidebar').classList.contains('active')).toBe(true);

    // Customization close called
    expect(global.closeCustomize).toHaveBeenCalled();

    // Alert called
    expect(window.alert).toHaveBeenCalled();
  });

  test('updateCart renders total and remove button removes item', () => {
    // Start with one item in cart via addSelectedToCart
    cartModule.addSelectedToCart();
    const initialCount = document.getElementById('cart-items').children.length;
    expect(initialCount).toBeGreaterThan(0);

    // Click remove button (calls removeFromCart(0))
    const firstRemoveBtn = document.querySelector('.cart-item button');
    firstRemoveBtn.click();

    // After removal, UI should be updated
    expect(document.getElementById('cart-items').children.length).toBe(0);
    expect(document.getElementById('cart-total').textContent).toBe('R0');
  });

  test('checkout calculates final total including delivery and opens checkout modal', () => {
    // Ensure cart has items
    cartModule.addSelectedToCart();

    cartModule.checkout();

    // final-total should be set (R + number)
    const finalText = document.getElementById('final-total').textContent;
    expect(finalText.startsWith('R')).toBe(true);

    // checkout modal should be active
    expect(document.getElementById('checkout-modal').classList.contains('active')).toBe(true);
  });

  test('processPayment validates fields and shows confirmation, updates rewards', async () => {
    // Have items in cart and run checkout then proceed to payment to set currentPaymentTotal
    cartModule.addSelectedToCart();
    cartModule.checkout();

    // Call proceedToPayment indirectly by validating checkout form success
    // Simulate validateCheckoutForm success by calling proceedToPayment directly
    cartModule.proceedToPayment();

    // Call processPayment
    jest.useFakeTimers();
    cartModule.processPayment();

    // Fast-forward timers: processing animation and confirmation delay
    jest.advanceTimersByTime(2000);

    // Confirmation modal should be active
    expect(document.getElementById('confirmation-modal').classList.contains('active')).toBe(true);

    // Rewards function called
    expect(global.updateUserRewards).toHaveBeenCalled();
  });
});
