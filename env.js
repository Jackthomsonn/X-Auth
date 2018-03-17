const env = {
  SALT_WORK_FACTOR: 10,
  COOKIE_NAME: process.env.COOKIE_NAME || 'generic-cookie',
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY || '1234'
}

module.exports = env