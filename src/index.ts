import { PrideBadge } from './pride-badge';

// Defines the element once; does nothing where there is no DOM (server rendering).
if (typeof customElements !== 'undefined' && !customElements.get('pride-badge')) {
  customElements.define('pride-badge', PrideBadge);
}

export { PrideBadge };
