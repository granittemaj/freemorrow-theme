# Shopify custom pixels

Code for the pixels in Shopify admin > Settings > Customer events. Shopify runs them in a sandbox on every storefront
page and through checkout, so they are kept here for reference and pasted into the admin, not deployed with the theme.

| Pixel | File | Permission | Data sale |
| --- | --- | --- | --- |
| Google Analytics 4 (`G-Y5VWECDL4B`, stream "Freemorrow") | `google-analytics-4.js` | Required: Analytics only | Qualifies as data sale (visitors who opt out are not tracked) |

The GA4 pixel sends page views and the ecommerce events: `view_item_list`, `view_item`, `search`, `add_to_cart`,
`remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info` and `purchase`. It runs only
for visitors whose cookie choices allow analytics (the theme's cookie banner sets them through Shopify's Customer
Privacy API). To change it, edit the pixel in the admin and copy the code back here.
