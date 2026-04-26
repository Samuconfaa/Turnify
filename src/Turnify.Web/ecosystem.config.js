module.exports = {
  apps: [
    {
      name: 'turnify-web',
      script: '.next/standalone/server.js',
      cwd: '/var/www/turnify/Turnify.Web',
      env: {
        NODE_ENV: 'production',
        PORT: '3004',
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
