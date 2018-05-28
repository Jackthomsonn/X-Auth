const env = {
  // Security settings (Required)
  SALT_WORK_FACTOR: undefined,
  COOKIE_NAME: undefined,
  AUTH_SECRET_KEY: undefined,
  AUTH_SECRET_KEY_FORGOTTEN_PASSWORD: undefined,
  JWT_TOKEN_EXPIRATION: undefined,

  // App specific details (Required)
  DOMAIN_EMAIL: undefined,
  APP_NAME: undefined,
  PORT: undefined,
  DATABASE_URI: undefined,
  THEME_COLOUR: undefined,
  EMAIL_VERIFICATION: undefined,

  // Text messaging client (two factor auth enabled account only / By default, two factor is not set) (Optional)
  TEXT_MAGIC_USERNAME: undefined,
  TEXT_MAGIC_TOKEN: undefined,

  // Template Options (Optional)
  VERIFICATION_PAGE_TEMPLATE: undefined,
  FORGOTTEN_PASSWORD_PAGE_TEMPLATE: undefined
}

module.exports = env