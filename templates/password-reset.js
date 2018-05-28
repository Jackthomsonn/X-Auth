const env = require('../environment/env')
const ms = require('ms')

const PasswordResetEmailTemplate = (url) => {
  return `<div style='display: flex; flex-flow: column wrap; justify-content: center; align-items: center; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: #222; text-align: center'>
  <strong style='font-size: 16px'>Password Reset Request for ${env.APP_NAME}</strong>
  <p style="font-size: 14px">A request has been made on your account to reset your password. If this was you, please click the button below</p>

  <a href=${url} style="border: none; background: ${env.THEME_COLOUR || '#222'}; color: #FFF; padding: 12px; border-radius: 4px; font-size: 14px; width: 40%; text-decoration: none!important">Reset password</a>

  <p style="font-size: 14px">(This link will expire in ${ms(env.JWT_TOKEN_EXPIRATION)})</p>

</div>`
}

module.exports = PasswordResetEmailTemplate