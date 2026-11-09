// Freemorrow: Google Analytics 4, as a Shopify custom pixel (Settings > Customer events > Google Analytics 4).
// Shopify runs it in a sandbox on every page and through checkout, and only for visitors whose cookie choices allow
// analytics. It sends page views and the GA4 ecommerce events, from viewing a product to the purchase.
// Measurement ID: G-Y5VWECDL4B (stream "Freemorrow", https://freemorrow.com).

const MEASUREMENT_ID = 'G-Y5VWECDL4B';

const tag = document.createElement('script');
tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
tag.async = true;
document.head.appendChild(tag);

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
// page views are sent from Shopify's events below, with the real page address rather than the sandbox's
gtag('config', MEASUREMENT_ID, { send_page_view: false });

const page = (event) => ({
  page_location: event.context.document.location.href,
  page_title: event.context.document.title,
  page_referrer: event.context.document.referrer,
});
const money = (m) => (m && m.amount != null ? Number(m.amount) : undefined);
const item = (variant, quantity, extra) => Object.assign({
  item_id: (variant && variant.product && variant.product.id) || (variant && variant.id),
  item_name: (variant && variant.product && variant.product.title) || (variant && variant.title),
  item_variant: variant && variant.title,
  item_brand: variant && variant.product && variant.product.vendor,
  item_category: variant && variant.product && variant.product.type,
  price: variant && money(variant.price),
  quantity: quantity || 1,
}, extra || {});
const checkoutItems = (checkout) => (checkout.lineItems || []).map((line) => item(line.variant, line.quantity));

analytics.subscribe('page_viewed', (event) => {
  gtag('event', 'page_view', page(event));
});

analytics.subscribe('collection_viewed', (event) => {
  const c = event.data.collection;
  gtag('event', 'view_item_list', Object.assign(page(event), {
    item_list_id: c.id,
    item_list_name: c.title,
    items: (c.productVariants || []).slice(0, 50).map((v) => item(v, 1)),
  }));
});

analytics.subscribe('product_viewed', (event) => {
  const v = event.data.productVariant;
  gtag('event', 'view_item', Object.assign(page(event), {
    currency: v.price && v.price.currencyCode,
    value: money(v.price),
    items: [item(v, 1)],
  }));
});

analytics.subscribe('search_submitted', (event) => {
  gtag('event', 'search', Object.assign(page(event), { search_term: event.data.searchResult.query }));
});

analytics.subscribe('product_added_to_cart', (event) => {
  const line = event.data.cartLine;
  gtag('event', 'add_to_cart', Object.assign(page(event), {
    currency: line.cost.totalAmount.currencyCode,
    value: money(line.cost.totalAmount),
    items: [item(line.merchandise, line.quantity)],
  }));
});

analytics.subscribe('product_removed_from_cart', (event) => {
  const line = event.data.cartLine;
  gtag('event', 'remove_from_cart', Object.assign(page(event), {
    currency: line.cost.totalAmount.currencyCode,
    value: money(line.cost.totalAmount),
    items: [item(line.merchandise, line.quantity)],
  }));
});

analytics.subscribe('cart_viewed', (event) => {
  const cart = event.data.cart;
  if (!cart) return;
  gtag('event', 'view_cart', Object.assign(page(event), {
    currency: cart.cost.totalAmount.currencyCode,
    value: money(cart.cost.totalAmount),
    items: (cart.lines || []).map((l) => item(l.merchandise, l.quantity)),
  }));
});

analytics.subscribe('checkout_started', (event) => {
  const c = event.data.checkout;
  gtag('event', 'begin_checkout', Object.assign(page(event), {
    currency: c.currencyCode, value: money(c.totalPrice), items: checkoutItems(c),
  }));
});

analytics.subscribe('checkout_shipping_info_submitted', (event) => {
  const c = event.data.checkout;
  gtag('event', 'add_shipping_info', Object.assign(page(event), {
    currency: c.currencyCode, value: money(c.totalPrice), items: checkoutItems(c),
  }));
});

analytics.subscribe('payment_info_submitted', (event) => {
  const c = event.data.checkout;
  gtag('event', 'add_payment_info', Object.assign(page(event), {
    currency: c.currencyCode, value: money(c.totalPrice), items: checkoutItems(c),
  }));
});

analytics.subscribe('checkout_completed', (event) => {
  const c = event.data.checkout;
  gtag('event', 'purchase', Object.assign(page(event), {
    transaction_id: (c.order && c.order.id) || c.token,
    currency: c.currencyCode,
    value: money(c.totalPrice),
    tax: money(c.totalTax),
    shipping: c.shippingLine ? money(c.shippingLine.price) : undefined,
    items: checkoutItems(c),
  }));
});
