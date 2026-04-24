import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.NODE_ENV !== 'production';

export default {
  input: 'src/app/index.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: isDev,
    name: 'App',
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080'),
    }),
    resolve({ browser: true, extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json', sourceMap: isDev }),
    postcss({
      modules: true,
      extract: true,
      minimize: !isDev,
    }),
    isDev && serve({ contentBase: ['dist', 'public'], port: 3000, open: true }),
    isDev && livereload('dist'),
  ].filter(Boolean),
  watch: {
    clearScreen: false,
  },
};
