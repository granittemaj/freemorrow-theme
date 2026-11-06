# Freemorrow: Follow the sun (Shopify theme)

An Online Store 2.0 theme for freemorrow.com, built from the prototype at https://granittemaj.github.io/freemorrow-theme/.
It reads the store's own products, collections, menus and pages; nothing is hard-coded except the bundled photographs,
which stand in until you choose your own in the theme editor.

## Install

**From the zip** (simplest): Online Store › Themes › Add theme › Upload zip file, and choose `freemorrow-follow-the-sun.zip`
from the latest release: https://github.com/granittemaj/freemorrow-theme/releases/latest

**From GitHub** (keeps it in sync): Online Store › Themes › Add theme › Connect from GitHub, choose this repository and the
`shopify-theme` branch. Pushing to that branch updates the theme.

**With the Shopify CLI**, from this folder:

```bash
shopify theme push --unpublished --store gjdy1j-xh.myshopify.com
```

The theme arrives unpublished. Preview it, run through the checklist below, then publish.

## Before publishing

1. **About page**: Online Store › Pages › About › Theme template: choose `page.about`.
2. **Contact page**: Pages › Contact › Theme template: choose `page.contact`.
3. **Menus**: the header shows "The story" and then the top-level links of the Main menu. Suggested: Shop (/collections/all), About, Contact.
   The footer shows the Main menu and the Footer menu; change either in Theme settings › Footer.
4. **Chat**: Shopify Inbox is an app embed. In the theme editor open App embeds and switch it on again.
5. **Photos and film**: each story chapter, shop place and About section has an image picker. Until one is chosen it uses the
   photographs bundled with the theme. The film plays from its current address on the Shopify CDN; to manage it in the
   admin, upload it to Content › Files and pick it in the Film setting of the story and the canopy place.
6. **Logos and favicon**: Theme settings › Logo. The bundled striped-sun logos are used until you choose your own.

## How it is built

| Page | Template | Sections |
| --- | --- | --- |
| Home | `index.json` | `story`: six chapter blocks (drawn sunrise, film, woodland, terraces, ridge, drawn sunset). Keep all six. |
| Shop and collections | `collection.json` | `main-collection`: Place blocks (the four places and what was worn there), photo tiles between products, collection chips |
| Product | `product.json` | `main-product` (with Details panel blocks), `product-recommendations` |
| About | `page.about.json` | `about-open`, `about-mission`, `about-process`, `about-archive`, `about-faq`, `about-sunset` |
| Everything else | `page`, `page.contact`, `cart`, `search`, `404`, `list-collections`, `blog`, `article`, `password`, `customers/*`, `gift_card` | |

- **Bag and quick look**: `assets/theme.js`, on Shopify's Ajax Cart API (`/cart/add.js`, `/cart/change.js`, `/cart.js`). The bag
  icon opens a drawer; checkout is Shopify's own.
- **Cards**: hovering a card shows the back of the piece and adds it by size; sizes sold out in the chosen colour are struck out.
- **Product photos** are shot on white, so they are blended onto the paper tiles (`mix-blend-mode: multiply`) to read as cut-outs.
- **Animation**: GSAP 3.12.5 with ScrollTrigger and Flip, bundled in `assets/` and loaded only on the home, shop and About pages.
  Everything respects reduced-motion settings.
- **Fonts**: Geist, Geist Mono and Newsreader (SIL Open Font License), served from the theme.

### Optional metafields

| Metafield | Type | Shows |
| --- | --- | --- |
| `custom.worn_photos` | List of files (images) | "Worn" photos under a product |
| `custom.pairs_with` | Product reference | "Pairs well with" on a product page |

### Colours

Swatches use Shopify's own swatch colours when an option has them, and otherwise the Freemorrow palette in
`snippets/swatch-color.liquid` (also in `assets/theme.js`). Add a line there for any new colour name.

## Checks

`shopify theme check` passes with no errors or warnings.
