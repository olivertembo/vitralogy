import Alert from "react-s-alert"

const options = {
  position: "bottom-left",
}

export default class ToastHelper {
  static LEVEL_INFO = 1
  static LEVEL_ERROR = 2
  static LEVEL_WARNING = 3
  static LEVEL_SUCCESS = 4

  static info(msg) {
    return Alert.info(msg, options)
  }

  static error(msg) {
    return Alert.error(msg, options)
  }

  static warning(msg) {
    return Alert.warning(msg, options)
  }

  static success(msg) {
    return Alert.success(msg, options)
  }

  static close(id) {
    return Alert.close(id)
  }

  static closeAll() {
    return Alert.closeAll()
  }

  static toast(payload) {
    const { level, text } = payload

    switch (level) {
      case this.LEVEL_ERROR:
        this.error(text)
        break
      case this.LEVEL_WARNING:
        this.warning(text)
        break
      case this.LEVEL_SUCCESS:
        this.success(text)
        break
      case this.LEVEL_INFO:
      default:
        this.info(text)
        break
    }
  }
}
