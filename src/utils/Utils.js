export default class Utils {
  static getFileTypeIcon(file) {
    const ext = file
      .substring(file.lastIndexOf(".") + 1, file.length)
      .toLowerCase()
    let fileType = "file"
    switch (ext) {
      case "pdf":
        fileType = "file-pdf-o"
        break
      case "zip":
      case "rar":
      case "tar":
      case "7z":
        fileType = "file-archive-o"
        break
      case "xls":
      case "xlsx":
      case "xlsm":
      case "xltx":
      case "xltm":
      case "xlsb":
      case "xlam":
        fileType = "file-excel-o"
        break
      case "doc":
      case "docx":
      case "docm":
      case "dotx":
      case "dotm":
        fileType = "file-word-o"
        break
      case "pptx":
      case "pptm":
      case "potx":
      case "potm":
      case "ppam":
      case "ppsx":
      case "ppsm":
      case "sldx":
      case "sldm":
      case "thmx":
        fileType = "file-powerpoint-o"
        break
      case "txt":
      case "text":
        fileType = "file-text-o"
        break
      case "tiff":
      case "bmp":
      case "jpeg":
      case "jpg":
      case "png":
      case "gif":
      case "svg":
        fileType = "file-image-o"
        break
      case "html":
      case "htm":
      case "xml":
        fileType = "file-code-o"
        break
      default:
        fileType = "file-o"
    }
    return fileType
  }

  static ellipsisText(str, len = 30) {
    if (str.length > len) {
      return str.substr(0, 17) + "..." + str.substr(str.length - 17, str.length)
    }
    return str
  }

  static binderPreviewerSupported = file => {
    const fileExtension = file
      .substring(file.lastIndexOf(".") + 1, file.length)
      .toUpperCase()

    // see here https://www.pdftron.com/documentation/web/guides/file-format-support
    switch (fileExtension) {
      case "PDF":
      case "DOCX":
      case "XLSX":
      case "PPTX":
      case "JPG":
      case "PNG":
        return true
      default:
        return false
    }
  }
}
