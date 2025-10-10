import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { readFileSync } from 'fs';

// Lire la version depuis package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      chunkSizeWarningLimit: 1000, // Déplacé au bon endroit
      rollupOptions: {
        output: {
          manualChunks: {
            // Regroupement des dépendances principales
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              'framer-motion',
              'axios',
              'react-hook-form'
            ],
            // Regroupement des composants UI
            ui: [
              'react-select',
              'react-swipeable',
              'swiper',
              '@fortawesome/fontawesome-svg-core',
              '@fortawesome/free-brands-svg-icons',
              '@fortawesome/free-regular-svg-icons',
              '@fortawesome/free-solid-svg-icons'
            ],
            // Regroupement des graphiques
            charts: [
              'chart.js',
              'react-chartjs-2',
              'react-heatmap-grid'
            ],
            // Utilitaires
            utils: [
              'moment',
              'moment-timezone',
              'prop-types'
            ]
          }
        }
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 Mo de limite de cache
          
          runtimeCaching: [
            {
              urlPattern: ({ url }) => {
                return url.pathname.startsWith('/api');
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                cacheableResponse: {
                  statuses: [0, 200]
                },
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semaine
                }
              }
            }
          ]
        },
        manifest: {
          name: 'StepsProno',
          short_name: 'StepsProno',
          description: 'Application de pronostics entre potes',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      'process.env': env,
      '__APP_VERSION__': JSON.stringify(packageJson.version)
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
