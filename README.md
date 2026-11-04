# pride-badge

A small pride badge for your website: **“Stronger together.”** next to the intersex-inclusive Progress Pride flag. Click it and pride flags fly; move the mouse near it and it leaves a short rainbow trail. One file, no dependencies, works with plain HTML, WordPress, Webflow, React, Vue and the rest.

**Demo:** https://flora-maxwell.github.io/pride-badge/

Made by [Flora Maxwell](https://floramaxwell.de), where it sits above the footer.

## Add it to your site

### From the CDN (easiest)

```html
<script src="https://cdn.jsdelivr.net/npm/pride-badge@1/dist/pride-badge.js" defer></script>

<pride-badge></pride-badge>
```

`@1` always gets the newest 1.x version: fixes yes, changes that break your page no.

Heads-up for your privacy policy: with the CDN, your visitors' browsers fetch the file from jsDelivr, which technically sees their IP address. If you'd rather avoid that, host the file yourself (below).

### Host it yourself (privacy-friendly)

Download [`dist/pride-badge.js`](https://cdn.jsdelivr.net/npm/pride-badge@1/dist/pride-badge.js), put it on your server and load it from there:

```html
<script src="/pride-badge.js" defer></script>
<pride-badge></pride-badge>
```

### With npm (React, Vue, Astro …)

```sh
npm install pride-badge
```

```js
import 'pride-badge';
```

Then use `<pride-badge></pride-badge>` in your markup. The import is safe in server rendering; the badge comes to life in the browser.

TypeScript types come with the package. For React with TypeScript, tell JSX about the element once:

```ts
import type { PrideBadgeAttributes } from 'pride-badge';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pride-badge': PrideBadgeAttributes & React.HTMLAttributes<HTMLElement>;
    }
  }
}
```

## Settings

| Attribute | What it does |
|---|---|
| `texts="…"` | Which sentences take turns on a click, in this order; the first is shown first. One sentence = no change, only flags. Default: all four. |
| `lang="de"` | German. Without it, the badge follows the page (`<html lang>`), else English. |
| `effects="off"` | No flags, no trail, no change of sentence: a calm button. |
| `trail="off"` | No rainbow trail at all, neither from the mouse nor from a finger. Flags still fly and the sentence still changes. |
| `touch-trail="off"` | On phones, a finger that starts on the badge leaves a rainbow trail, and the page doesn't scroll while it does. Switch it off if that gets in the way. |
| `shadow="off"` | No shadow (the light contour stays). |

Visitors who ask their system for reduced motion get no flags and no trail; the sentence still changes, without animation.

### Sentences

| Key | English | German |
|---|---|---|
| `stronger-together` | Stronger together. | Gemeinsam stärker. |
| `safe-with-me` | You’re safe with me. | Bei mir bist du sicher. |
| `love-is-love` | Love is love. | Liebe ist Liebe. |
| `you-belong` | You belong here. | Du gehörst dazu. |

```html
<pride-badge texts="safe-with-me love-is-love"></pride-badge>
<pride-badge texts="you-belong" lang="de"></pride-badge>
```

The sentences are a fixed list on purpose: the badge carries one message, and the package can't be made to say anything else. Would you like another sentence or language? [Open an issue](https://github.com/flora-maxwell/pride-badge/issues).

## Styling

The badge takes your page's font and grows with its `font-size`. Everything else through CSS custom properties:

| Property | Default |
|---|---|
| `--pride-badge-bg` | `#fafafa` |
| `--pride-badge-color` | `#18181b` |
| `--pride-badge-font` | your page's font |
| `--pride-badge-weight` | `500` |
| `--pride-badge-radius` | `0.75em` |
| `--pride-badge-contour` | `0 0 0 1px rgb(0 0 0 / .07)` |
| `--pride-badge-shadow` | `0 1px 2px rgb(0 0 0 / .06), 0 4px 14px rgb(0 0 0 / .08)` |
| `--pride-badge-focus-ring` | `2px solid #18181b` |
| `--pride-badge-focus-offset` | `2px` |
| `--pride-badge-focus-glow` | `0 0 0 5px #fafafa` |

Dark:

```css
pride-badge {
  --pride-badge-bg: #27272a;
  --pride-badge-color: #fafafa;
  --pride-badge-contour: 0 0 0 1px rgb(255 255 255 / .16);
  --pride-badge-shadow: 0 1px 2px rgb(0 0 0 / .3), 0 4px 14px rgb(0 0 0 / .35);
}
```

### Match your site's focus style

The badge is shielded from your page's CSS, so a site-wide `:focus-visible` rule doesn't reach it. Copy your focus values into these three:

```css
pride-badge {
  --pride-badge-focus-ring: 2px solid #6d28d9;   /* your outline */
  --pride-badge-focus-offset: 3px;               /* your outline-offset */
  --pride-badge-focus-glow: 0 0 transparent;     /* no light halo (write this, not "none") */
}
```

A soft glow instead of a halo, as on [floramaxwell.de](https://floramaxwell.de) (made for dark pages):

```css
pride-badge {
  --pride-badge-focus-ring: 1.5px solid rgb(255 255 255 / .95);
  --pride-badge-focus-offset: 3px;
  --pride-badge-focus-glow: 0 0 0 6px rgb(255 255 255 / .1), 0 0 22px 4px rgb(255 255 255 / .28);
}
```

To change its colour, swap the `255 255 255` in all three lines for your colour.

The badge's look lives in its own shadow DOM: your page's CSS doesn't reach inside, and the badge doesn't touch your page. Only the font family and size come from your page; italics, small caps, text shadows or right-to-left direction around it don't change the badge.

## Accessibility

A real button, reachable with the keyboard, with a visible focus ring. The flag has alt text, screen readers hear that a click throws flags, and a new sentence is announced politely. The flying flags and the trail are hidden from screen readers.

## Privacy

The badge sets no cookies, stores nothing in the browser and sends nothing anywhere. (Only loading it from the CDN involves jsDelivr, see above.)

## Licence and credits

Code: [MIT](LICENSE) © Flora Maxwell.
Flag: the intersex-inclusive Progress Pride flag, designed by Valentino Vecchietti; graphic by Nikki on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Intersex-inclusive_pride_flag.svg), public domain (CC0 1.0).
