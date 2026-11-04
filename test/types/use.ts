// Type check only (test/ssr.test.ts runs tsc on it): what a TypeScript project gets from the package.
import { PrideBadge } from 'pride-badge';

const badge: PrideBadge | null = document.querySelector('pride-badge');
const made: PrideBadge = document.createElement('pride-badge');
const key: string = made.key;
badge?.setAttribute('texts', 'safe-with-me');
export { key };
