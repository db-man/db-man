module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  env: {
    commonjs: {
      presets: [['@babel/preset-env', { modules: 'commonjs' }]],
    },
    es: {
      presets: [['@babel/preset-env', { modules: false }]],
    },
  },
  plugins: ['@babel/plugin-proposal-class-properties'],
  ignore: ['**/__snapshots__/*', '*.snap'],
};
