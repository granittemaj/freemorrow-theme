# Freemorrow theme concept: Follow the sun

A design concept for the [Freemorrow](https://freemorrow.com) Shopify store. The home page tells the brand story as one day: the striped sun from the logo rises over drawn mountains, opens into real film and photographs from the shoots (with shoppable pins on what is being worn), and sets again.

**Live preview:** https://granittemaj.github.io/freemorrow-theme/

| Page | What it shows |
| --- | --- |
| [Home](https://granittemaj.github.io/freemorrow-theme/) | The scroll story, then the collection |
| [Shop](https://granittemaj.github.io/freemorrow-theme/shop.html) | Shop by place, filters, sorting and quick add by size |
| [Product](https://granittemaj.github.io/freemorrow-theme/product.html?p=basecamp) | Product page with colours, sizes, details and worn photos |
| [About](https://granittemaj.github.io/freemorrow-theme/about.html) | Every stripe is a story: belief, mission, process, vision |

This is a static prototype (HTML, CSS and JavaScript, no build step). The bag and checkout are simulated; in production they hand off to Shopify.

## Shopify theme

`shopify/` is the same design as a Shopify Online Store 2.0 theme, wired to the store's products, collections, menus and
cart. See [shopify/README.md](shopify/README.md) for installing it (zip, GitHub branch `shopify-theme`, or the Shopify CLI)
and the checklist before publishing. The latest zip is on the [releases page](https://github.com/granittemaj/freemorrow-theme/releases/latest).

## Run it locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Structure

- `index.html`, `shop.html`, `product.html`, `about.html`: page shells
- `js/store.js`: catalogue, quick look and bag (`window.FM`)
- `js/details.js`: product descriptions and specifications
- `js/kit.js`: header, footer and the product page
- `js/story.js`, `js/shop.js`, `js/about.js`: the home, shop and about pages
- `css/`: styles (`kit.css` base, `sunrise.css` story, `pages.css` shop and about)
- `assets/`: photographs, logos and product cut-outs (`assets/pc/`)

Animations use [GSAP](https://gsap.com) with ScrollTrigger and Flip, loaded from cdnjs.
