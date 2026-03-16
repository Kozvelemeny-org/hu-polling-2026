import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['layercake']
	},
	// Avoid __publicField / class-static-field errors when maplibre-gl (or pmtiles) cache is re-optimized
	optimizeDeps: {
		include: ['maplibre-gl', 'pmtiles'],
		esbuildOptions: {
			target: 'es2022'
		}
	},
	build: {
		target: 'es2022'
	}
});
