import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/config/**/*.{ts,tsx}',
    './src/controllers/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/libs/**/*.{ts,tsx}',
    './src/middlewares/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}',
    './src/types/**/*.{ts,tsx}',
    './src/utils/**/*.{ts,tsx}',
  ],
};

export default config;
