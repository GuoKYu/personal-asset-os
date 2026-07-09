/**
 * ParticleBackground — disabled for the TDesign flat-enterprise migration.
 *
 * The original Three.js floating-particle field conflicted with TDesign's calm,
 * flat aesthetic. It now renders nothing (no-op) so every existing import site
 * keeps working without changes. Three.js is therefore dropped from the bundle,
 * which also improves load performance.
 *
 * If a TDesign-aligned ambient treatment is desired later, re-implement here
 * using CSS only (e.g. a subtle static brand tint) — not a WebGL loop.
 */
export default function ParticleBackground(_props: { count?: number; className?: string } = {}) {
  return null;
}
