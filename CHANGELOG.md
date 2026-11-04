# Changelog

What changed in each version of `pride-badge`. The newest version is on top.

Versions follow [Semantic Versioning](https://semver.org/): a fix raises the last number, a new option the middle one, and a change that could break your page the first. `pride-badge@1` on the CDN always gets the newest 1.x version.

## [1.1.0] – 2026-11-04

### Added

- `trail-reach`: how far from the badge, in pixels, the mouse starts the rainbow trail. Default 60, from 0 (only on the badge itself) to 300.
- Demo page: a "Focus" section (the default ring and a glowing ring, as on floramaxwell.de) and a "Trail reach" example. The quieter badges sit further apart with a label each.

## [1.0.0] – 2026-11-04

The first version.

- `<pride-badge>`: “Stronger together.” next to the intersex-inclusive Progress Pride flag, as one web component in one file without dependencies. Works in plain HTML, WordPress, Webflow, React, Vue and the rest.
- A click (or Enter or Space) throws 🏳️‍🌈 and 🏳️‍⚧️ flags and rolls in the next sentence. Four fixed sentences in English and German, chosen with `texts`, in that order.
- The mouse near the badge leaves a short rainbow trail. On phones and tablets, a finger dragged from the badge does the same.
- Options: `lang`, `texts`, `effects="off"`, `trail="off"`, `touch-trail="off"`, `shadow="off"`.
- Looks: CSS variables for colours, font, weight, corner radius, contour, shadow and the focus style (ring, offset, glow), so the badge can match your site's own focus style. A dark look as an example in the README.
- Accessible: a real button with a clear name, a visible focus ring. With reduced motion no flags fly and there is no trail; the sentence still changes, without animation.
- Works under a strict Content Security Policy and Trusted Types.
- On npm and jsDelivr, MIT licence.

[1.1.0]: https://github.com/flora-maxwell/pride-badge/releases/tag/v1.1.0
[1.0.0]: https://github.com/flora-maxwell/pride-badge/releases/tag/v1.0.0
