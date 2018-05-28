const env = require('../environment/env')

const VerifyAccountEmailTemplate = (url) => {
  return `<div style='display: flex; flex-flow: column wrap; justify-content: center; align-items: center; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: #222; text-align: center'>
    <strong style='font-size: 16px'>Verify your ${env.APP_NAME} account</strong>
    <p style="font-size: 14px">Please verify your account by clicking on the button below</p>

    <a href=${url} style="border: none; background: ${env.THEME_COLOUR || '#222'}; color: #FFF; padding: 12px; border-radius: 4px; font-size: 14px; width: 40%; text-decoration: none!important">Verify account</a>

  </div>`
}

module.exports = VerifyAccountEmailTemplate