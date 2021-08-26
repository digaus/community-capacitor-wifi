import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'electron/build/electron/src/index.js',
    output: {
        file: 'electron/dist/plugin.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
    },
    external: ['@capacitor/core', 'os', 'node-wifi'],
    plugins: [resolve(), commonjs()]
};