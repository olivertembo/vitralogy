import React from "react"
import DropzoneComponent from "react-dropzone-component"

require("../../node_modules/react-dropzone-component/styles/filepicker.css")
require("../../node_modules/dropzone/dist/min/dropzone.min.css")

class FileUpload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      files: [],
    }

    // For a full list of possible configurations,
    // please consult http://www.dropzonejs.com/#configuration
    this.djsConfig = {
      maxFiles: 1,
      dictDefaultMessage: "Drop file here to upload",
      addRemoveLinks: true,
      acceptedFiles: props.acceptedFiles,
      autoProcessQueue: false,
      uploadMultiple: false,
      createImageThumanails: false,
    }

    this.componentConfig = {
      showFiletypeIcon: false,
      postUrl: "nourl",
    }
  }

  render() {
    const config = this.componentConfig
    const djsConfig = this.djsConfig

    // For a list of all possible events (there are many), see README.md!
    const eventHandlers = {
      addedfile: this.props.handlers.added,
      success: this.props.handlers.success,
      removedfile: this.props.handlers.removed,
      init: this.props.handlers.init,
    }

    return (
      <DropzoneComponent
        config={config}
        eventHandlers={eventHandlers}
        djsConfig={djsConfig}
      />
    )
  }
}

export default FileUpload
