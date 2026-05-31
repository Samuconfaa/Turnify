import type { Config } from 'tailwindcss';

// Tailwind non è più usato come design system primario.
// Il CSS è gestito da globals.css (turniup design system).
const config: Config = {
  content: [],
  corePlugins: { preflight: false },
  plugins: [],
};

export default config;
