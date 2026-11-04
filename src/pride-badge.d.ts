/** <pride-badge>: a pride badge for any website. https://github.com/flora-maxwell/pride-badge */
export type PrideBadgeText = 'stronger-together' | 'safe-with-me' | 'love-is-love' | 'you-belong';

export declare class PrideBadge extends HTMLElement {
  static observedAttributes: string[];
  /** The sentence shown right now. */
  readonly key: PrideBadgeText;
}

/** The attributes, for frameworks' JSX typings (see the README). */
export interface PrideBadgeAttributes {
  /** Space-separated sentence keys, in the order they take turns. */
  texts?: string;
  lang?: 'en' | 'de' | (string & {});
  effects?: 'off';
  /** No rainbow trail at all, from mouse or finger. */
  trail?: 'off';
  /** No trail from a finger only; the page scrolls as usual. */
  'touch-trail'?: 'off';
  shadow?: 'off';
}

declare global {
  interface HTMLElementTagNameMap {
    'pride-badge': PrideBadge;
  }
}
