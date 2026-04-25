module.exports = {
  apps: [
    {
      name: 'turnify-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3004',
      cwd: '/var/www/turnify/src/Turnify.Web',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
