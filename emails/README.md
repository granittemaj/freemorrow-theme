# Freemorrow customer emails

Shopify's customer notifications (Settings › Notifications › Customer notifications), styled to match
freemorrow.com: a cream page, ink text, Instrument Serif headings, Geist text, Geist Mono labels, ink pill
buttons and a forest-green footer with the Not For Sale line and links.

All 46 customer notification templates carry the same two blocks, added on top of Shopify's own templates so
Shopify's order logic stays untouched:

- `brand-head.html` goes before `</head>`: the fonts (as `@font-face`, because Shopify strips `<link>` tags) and
  the colour and type overrides. Shopify inlines these styles when it sends the email.
- `brand-footer.html` goes at the top of the footer, above Shopify's "If you have any questions" line.

Both are wrapped in `<!-- fm:brand-head -->` and `<!-- fm:brand-footer -->` comments, so running the script
again replaces them instead of adding a second copy.

## Changing the look

1. Edit `brand-head.html` or `brand-footer.html`.
2. Run `python3 emails/build.py`. It writes `apply.bundle.js`.
3. For each email: open it in Shopify, click Edit code, paste `apply.bundle.js` into the browser console, then
   click Save. Check it with Preview.

Email apps without web fonts (Gmail, Outlook) show Georgia and Helvetica instead of the brand fonts.
The logo at the top and the accent colour come from Settings › Notifications › Customize email templates.

Not covered here: the abandoned checkout email (Marketing › Automations, Shopify Messaging), the sign-in code
emails of the new customer accounts (they use the logo and colour from Customize email templates), and staff
notifications.
