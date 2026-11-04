/**
 * The badge's look (Figma, Vicky file, node 46:285; Flo's prototype picks 2026-11-03). Sizes in em so
 * it grows with the page's font size; colours, contour and shadow from --pride-badge-* variables.
 * Spacing is set explicitly so odd page styles that inherit (letter-spacing, line-height …) don't leak in.
 */
export const CSS = `
:host {
  display: inline-block;
  vertical-align: middle;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-indent: 0;
  text-align: left;
  white-space: nowrap;
  direction: ltr;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  font-stretch: normal;
  text-shadow: none;
  -webkit-text-fill-color: currentColor;
  --_contour: var(--pride-badge-contour, 0 0 0 1px rgb(0 0 0 / .07));
  --_shadow: var(--pride-badge-shadow, 0 1px 2px rgb(0 0 0 / .06), 0 4px 14px rgb(0 0 0 / .08));
}
:host([shadow="off"]) { --_shadow: 0 0 #0000; }
:host([hidden]) { display: none; }
@media (prefers-reduced-motion: no-preference) {
  :host(:not([trail="off"]):not([touch-trail="off"]):not([effects="off"])) { touch-action: none; }
}
button {
  display: inline-flex;
  align-items: center;
  gap: .75em;
  box-sizing: border-box;
  margin: 0;
  padding: .5em 1em .5em .5em;
  border: 0;
  border-radius: var(--pride-badge-radius, .75em);
  background: var(--pride-badge-bg, #fafafa);
  color: var(--pride-badge-color, #18181b);
  -webkit-text-fill-color: currentColor;
  box-shadow: var(--_contour), var(--_shadow);
  font-family: inherit;
  font-family: var(--pride-badge-font);
  font-weight: var(--pride-badge-weight, 500);
  font-size: 1em;
  line-height: 1.5em;
  letter-spacing: inherit;
  text-transform: inherit;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
button:focus-visible {
  outline: var(--pride-badge-focus-ring, 2px solid #18181b);
  outline-offset: var(--pride-badge-focus-offset, 2px);
  box-shadow: var(--_contour), var(--_shadow), var(--pride-badge-focus-glow, 0 0 0 5px #fafafa);
}
.flag {
  display: block;
  flex: none;
  width: 2.4375em;
  height: 1.5em;
  border-radius: .25em;
  overflow: hidden;
}
.flag svg { display: block; width: 100%; height: 100%; }
.text { position: relative; display: inline-block; }
.text > span { display: inline-block; }
.sr, .live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
`;
