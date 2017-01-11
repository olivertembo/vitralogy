/* config-overrides.js */
const { override, addWebpackAlias } = require("customize-cra")
const path = require("path");

module.exports = override(
  addWebpackAlias({
    "@ant-design/icons/lib/dist$": path.resolve(
      __dirname,
      "./src/assets/icons/antd/icons.js"
    )
  })
)
