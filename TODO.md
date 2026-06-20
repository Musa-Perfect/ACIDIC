# ACIDIC Clothing Website - Step-by-step TODO (Core Customer Flow)

> Goal: ensure the end-to-end customer journey works (browse → buy → pay → get confirmation), and that admin can manage products + orders.

## 0) Quick verification (server health)

- [ ] Start backend and confirm it responds on `/api/products` and `/api/orders/my-orders` (with auth).
- [ ] Confirm products can load via `GET /api/products`.

## 1) Homepage + navigation

- [ ] Ensure `home.html` / `index.html` correctly show home content on first load.
- [ ] Ensure navigation triggers correct sections/pages:
  - [ ] Home → shop-home transition works
  - [ ] Shop → loads product list
  - [ ] Cart → opens cart sidebar with correct items
  - [ ] Sign up / login → opens auth UI

## 2) Shop + product listing

- [ ] Implement/verify product listing page calls `GET /api/products`.
- [ ] Implement/verify filters/sorting:
  - [ ] Category filtering
  - [ ] Search (if present)
  - [ ] Sort (newest/popular/price)
- [ ] Confirm product cards use fields that actually exist in your product model (name, price, images, category, etc.).

## 3) Product details

- [ ] Ensure clicking a product loads `product.html?id=PRODUCT_ID`.
- [ ] Ensure `GET /api/products/:id` is called and UI renders:
  - [ ] Image gallery
  - [ ] Name + price
  - [ ] Description
  - [ ] Color selection (if variant-driven)
  - [ ] Size selection
- [ ] Confirm reviews load from `/api/reviews` (if your UI supports it).

## 4) Cart (front-end cart)

- [ ] Confirm cart storage strategy:
  - [ ] Cart is stored in localStorage (e.g., `acidicCart`) OR backed by server
- [ ] Ensure cart items include everything checkout/order needs:
  - [ ] `product` id
  - [ ] `quantity`
  - [ ] `variant` (if supported)
  - [ ] `size` / `color` (if supported in UI; map to backend fields if required)
- [ ] Implement/verify cart update actions:
  - [ ] Increase/decrease quantity
  - [ ] Remove item
  - [ ] Clear cart
- [ ] Confirm cart total calculation matches backend order totals logic (subtotal + shipping + tax).

## 5) Checkout + order creation

Backend endpoint (confirmed):

- [ ] `POST /api/orders` (protected) calls `createOrder` in `acidic-backend/controllers/orderController.js`

Checklist:

- [ ] Checkout UI gathers:
  - [ ] shippingAddress (required by backend)
  - [ ] paymentMethod
  - [ ] items array: `{ product, quantity, variant }`
- [ ] Confirm payload shape matches backend expectations:
  - [ ] `items` is an array
  - [ ] each item has `product` and `quantity`
- [ ] Confirm the backend calculates:
  - [ ] `shipping = 150`
  - [ ] `tax = subtotal * 0.15`
  - [ ] `grandTotal = subtotal + shipping + tax`
- [ ] After `POST /api/orders`, confirm:
  - [ ] Order is created
  - [ ] Stock decreases correctly
  - [ ] Loyalty points updated

## 6) Payments integration (PayFast/PayPal)

Front-end is already wired with PayFast/PayPal scripts.
Core requirement:

- [ ] Confirm payment finalization updates the Order status.

Backend currently only updates status via:

- [ ] `PUT /api/orders/:id/status` (protected, admin)

Checklist:

- [ ] Verify PayFast callback/notify flow:
  - [ ] Return URL loads a success/cancel page
  - [ ] Cancel URL loads a cancel page
  - [ ] Notify URL triggers server-side handler (if implemented)
- [ ] Ensure notify handler (if you have it) calls order status update to `paid`/`processing`.
- [ ] Ensure frontend success page uses the correct order id (if required).

## 7) Success/confirmation pages

- [ ] Success page shows:
  - [ ] Order details summary
  - [ ] Total paid
  - [ ] Shipping/ETA info
  - [ ] Rewards earned (if you support it)
- [ ] Confirm cart is cleared after successful payment.

## 8) Reviews (end-to-end)

- [ ] Confirm reviews endpoints exist and are wired:
  - [ ] list reviews for product
  - [ ] create review (protected)
- [ ] Confirm product detail UI renders reviews.

## 9) Shipping/returns/legal + contact

- [ ] Ensure these pages exist and are linked:
  - [ ] Shipping & Returns
  - [ ] Terms
  - [ ] Privacy Policy
  - [ ] Contact

## 10) Admin workflow (products + inventory)

Backend confirmed:

- [ ] Products CRUD + inventory:
  - [ ] `POST /api/products` (admin)
  - [ ] `PUT /api/products/:id` (admin)
  - [ ] `DELETE /api/products/:id` (admin)
  - [ ] `PUT /api/products/:id/inventory` (admin)

Checklist:

- [ ] Admin product create/edit works.
- [ ] Image upload works and product images are stored correctly.
- [ ] Inventory stock updates correctly.

## 11) Admin workflow (orders)

Backend confirmed:

- [ ] `PUT /api/orders/:id/status` (admin)

Checklist:

- [ ] Admin can view all orders.
- [ ] Admin can update order status and tracking.
- [ ] Status changes reflect in customer order history.

## 12) Security hardening

- [ ] Ensure `protect` middleware is applied to all private routes.
- [ ] Ensure `authorize('admin')` guards admin routes.
- [ ] Ensure auth cookies/JWT secret are set in environment.
- [ ] Add/verify input validation for:
  - [ ] checkout address
  - [ ] order items payload
  - [ ] product admin forms

## 13) Critical dependency check (must fix if blocked)

- [ ] Validate Product model imports are correct.
  - [ ] `acidic-backend/models/Product.js` is currently a stub (exports `undefined`).
  - [ ] Ensure real product model exists under `acidic-backend/models/` and routes/controllers reference it.

---

## How to test quickly (recommended)

- [ ] Load homepage → go to shop → open product → add to cart.
- [ ] Checkout → create order → proceed to payment.
- [ ] After payment, confirm success page + order appears in my orders.
- [ ] Login as admin → update order status → verify it appears in customer history.
