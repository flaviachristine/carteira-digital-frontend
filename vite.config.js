import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
function figmaAssetResolver() {
    return {
        name: 'figma-asset-resolver',
        resolveId(id) {
            if (id.startsWith('figma:asset/')) {
                const filename = id.replace('figma:asset/', '');
                return path.resolve(__dirname, 'src/assets', filename);
            }
        },
    };
}
export default defineConfig(({ mode }) => {
    // Carrega o .env para saber para onde apontar o proxy de desenvolvimento.
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

    return {
    // Proxy de desenvolvimento: o front chama "/api/auth/login" e o Vite repassa para
    // "http://localhost:8080/auth/login". Serve para dois problemas de uma vez —
    // o backend não configura CORS (o navegador bloquearia a chamada cross-origin de
    // localhost:5173 para localhost:8080) e o front fica com uma URL única em dev e prod.
    // Em produção defina VITE_API_URL com a URL pública da API e libere CORS no Spring.
    server: {
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api/, ''),
            },
        },
    },
    plugins: [
        figmaAssetResolver(),
        // The React and Tailwind plugins are both required for Make, even if
        // Tailwind is not being actively used – do not remove them
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            // Alias @ to the src directory
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Some source helpers (e.g. src/helpers/formatter.js) contain JSX while
    // keeping a .js extension, which esbuild would not parse by default.
    esbuild: {
        include: /src[\\/].*\.[jt]sx?$/,
        exclude: [],
        loader: 'jsx',
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
    };
});
