const env = {
  // App specific details (Required)
  DOMAIN_EMAIL: undefined,
  APP_LOGO: undefined,
  APP_NAME: undefined,
  DATABASE_URI: undefined,
  THEME_COLOUR: undefined,
  EMAIL_VERIFICATION: undefined,
  BASE_URI: undefined,

  // Security settings (Required)
  SALT_WORK_FACTOR: undefined,
  COOKIE_NAME: undefined,
  COOKIE_NAME_FORGOTTEN_PASSWORD: undefined,
  AUTH_SECRET_KEY: undefined,
  AUTH_SECRET_KEY_FORGOTTEN_PASSWORD: undefined,
  JWT_TOKEN_EXPIRATION: undefined,
  PASSWORD_STRENGTH: undefined,
  REFRESH_TOKEN_EXPIRATION: undefined,
  REFRESH_TOKEN_SECRET_KEY: undefined,
  REFRESH_TOKEN_COOKIE_NAME: undefined,
  UPDATE_PROFILE_JWT_EXPIRATION: undefined,
  UPDATE_PROFILE_JWT_KEY: undefined,

  // Text messaging client (two factor auth enabled account only / By default, two factor is not set) (Optional)
  TEXT_MAGIC_USERNAME: undefined,
  TEXT_MAGIC_TOKEN: undefined,
}

module.exports = env