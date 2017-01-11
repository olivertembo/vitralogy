import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import ButtonGroup from "react-bootstrap/lib/ButtonGroup"

const propTypes = {
  enablePaging: PropTypes.bool,
  onNextDocument: PropTypes.func,
  onPreviousDocument: PropTypes.func,
  onShowListView: PropTypes.func,
  onDownloadDocument: PropTypes.func,
}

const defaultProps = {
  enablePaging: false,
  onNextDocument: () => {},
  onPreviousDocument: () => {},
  onShowListView: () => {},
  onDownloadDocument: () => {},
}

const licenseKey =
  "Vitralogy LLC(vitralogy.com):OEM:Virtual Binder::B+:AMS(20200410):86A54FFD0457460A3360B13AC982535860617F95A9266A5BDB1C9409AD3470F054AA31F5C7"

class WebViewer extends React.Component {
  constructor(props) {
    super(props)

    this.viewer = React.createRef()
    this.docViewer = null
    this.instance = null
  }

  componentDidMount() {
    this.myWebViewer = new window.WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: this.props.file,
        l: licenseKey,
        // documentType options:
        // xod - default
        // pdf - pdf and images
        // office - office docs only
        // all - pdf + office
        documentType: "all",
        disabledElements: [
          "notesPanelButton",
          "notesPanel",
          "downloadButton",
          "textPopup",
        ],
      },
      this.viewer.current,
    ).then(instance => {
      this.instance = instance
      this.docViewer = instance.docViewer

      instance.disableTools()
      instance.openElements(["leftPanel", "thumbnailsPanel"])
      instance.setFitMode(instance.FitMode.FitWidth)
      instance.useEmbeddedPrint(false) // disable embedded printing

      const { disableNext, disablePrev } = this.props
      this.addCustomHeaders(disableNext, disablePrev)

      this.docViewer.on("documentLoaded", this.documentLoadedHandler)
      this.docViewer.on("webkitfullscreenchange", this.fullscreenHandler)
      this.docViewer.on("mozfullscreenchange", this.fullscreenHandler)
      this.docViewer.on("fullscreenchange", this.fullscreenHandler)
      this.docViewer.on("MSFullscreenChange", this.fullscreenHandler)

      this.props.onReady()
    })
  }

  componentDidUpdate(prevProps) {
    if (
      this.instance !== null &&
      (prevProps.disableNext !== this.props.disableNext ||
        prevProps.disablePrev !== this.props.disablePrev)
    ) {
      this.removeCustomHeaders()
      this.addCustomHeaders(this.props.disableNext, this.props.disablePrev)
    }
  }

  addCustomHeaders = (disableNext, disablePrev) => {
    const customButtons = (
      <ButtonToolbar>
        <ButtonGroup>
          <Button onClick={this.props.onShowListView}>Show List View</Button>
          <Button
            disabled={disablePrev}
            onClick={this.props.onPreviousDocument}
          >
            Previous Document
          </Button>
          <Button disabled={disableNext} onClick={this.props.onNextDocument}>
            Next Document
          </Button>
          <Button onClick={this.props.onDownloadDocument}>
            Download Document
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    )

    const viewerInstance = this.getInstance()
    if (this.props.enablePaging) {
      viewerInstance.setHeaderItems(header => {
        header.get("zoomInButton").insertAfter({
          type: "divider",
          dataElement: "customToolbarDivider",
        })
        header.get("customToolbarDivider").insertAfter({
          type: "customElement",
          render: () => customButtons,
          dataElement: "customToolbar",
        })
      })
    }
  }

  removeCustomHeaders = () => {
    const viewerInstance = this.getInstance()
    viewerInstance.setHeaderItems(function(headers) {
      headers.delete("customToolbarDivider")
      headers.delete("customToolbar")
      /* instead of using 'data-element', can use index like below
          let headerList = headers.getItems();
          // remove button from the end to start because index change as they are deleted
          for(var i = headerList.length - 1; i > 0; i--){
            if(headerList[i].toolName === 'Tools to remove'){
              headers.delete(i);
            }
          }
         */
    })
  }

  fullscreenHandler = () => {
    var inFullScreenMode =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    if (inFullScreenMode) {
      this.removeCustomHeaders()
    } else {
      const { disableNext, disablePrev } = this.props
      this.addCustomHeaders(disableNext, disablePrev)
    }
  }

  readyHandler = () => {
    const wv = this.getInstance()
    wv.disableTools()
    wv.openElements(["leftPanel", "thumbnailsPanel"])
    wv.setFitMode(wv.FitMode.FitWidth)
    wv.useEmbeddedPrint(false) // disable embedded printing

    //if (this.props.enablePaging) {
    //  wv.setHeaderItems(header => {
    //    header.get("zoomInButton").insertAfter({
    //        type: "actionButton",
    //        img:
    //        '<svg height="24px" id="Layer_1" style="enable-background:new 0 0 16 10;" version="1.1" viewBox="0 0 16 10" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Menu_List_3"><path d="M1.5,0h-1C0.224,0,0,0.224,0,0.5v1C0,1.776,0.224,2,0.5,2h1   C1.776,2,2,1.776,2,1.5v-1C2,0.224,1.776,0,1.5,0z" style="fill-rule:evenodd;clip-rule:evenodd;"/><path d="M15.5,0h-12C3.224,0,3,0.224,3,0.5v1C3,1.776,3.224,2,3.5,2h12   C15.776,2,16,1.776,16,1.5v-1C16,0.224,15.776,0,15.5,0z" style="fill-rule:evenodd;clip-rule:evenodd;"/><path d="M1.5,4h-1C0.224,4,0,4.224,0,4.5v1C0,5.776,0.224,6,0.5,6h1   C1.776,6,2,5.776,2,5.5v-1C2,4.224,1.776,4,1.5,4z" style="fill-rule:evenodd;clip-rule:evenodd;"/><path d="M15.5,4h-12C3.224,4,3,4.224,3,4.5v1C3,5.776,3.224,6,3.5,6h12   C15.776,6,16,5.776,16,5.5v-1C16,4.224,15.776,4,15.5,4z" style="fill-rule:evenodd;clip-rule:evenodd;"/><path d="M1.5,8h-1C0.224,8,0,8.224,0,8.5v1C0,9.776,0.224,10,0.5,10h1   C1.776,10,2,9.776,2,9.5v-1C2,8.224,1.776,8,1.5,8z" style="fill-rule:evenodd;clip-rule:evenodd;"/><path d="M15.5,8h-12C3.224,8,3,8.224,3,8.5v1C3,9.776,3.224,10,3.5,10h12   c0.276,0,0.5-0.224,0.5-0.5v-1C16,8.224,15.776,8,15.5,8z" style="fill-rule:evenodd;clip-rule:evenodd;"/></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>',
    //        onClick: this.props.onShowListView,
    //        dataElement: "showListView",
    //        title: "Show List View"
    //    });
    //    header.get("showListView").insertAfter({
    //        type: "actionButton",
    //        img:
    //        '<svg enable-background="new 0 0 48 48" height="24px" version="1.1" viewBox="0 0 48 48" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_3"><g><path d="M38.707,13.292l-9.999-9.999c-0.092-0.092-0.203-0.166-0.325-0.216C28.26,3.026,28.13,3,28,3H10C9.448,3,9,3.448,9,4v40    c0,0.552,0.448,1,1,1h28c0.552,0,1-0.448,1-1V14c0-0.13-0.026-0.26-0.077-0.382C38.872,13.496,38.799,13.385,38.707,13.292z     M29,6.414L35.586,13H29V6.414z M37,43H11V5h16v9c0,0.552,0.448,1,1,1h9V43z"/><path d="M21.796,23.159c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0l-5,5c-0.092,0.092-0.166,0.203-0.216,0.325    c-0.101,0.245-0.101,0.52,0,0.765c0.051,0.122,0.124,0.233,0.216,0.325l5,5c0.195,0.195,0.451,0.293,0.707,0.293    s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414l-3.293-3.293h13.586c0.552,0,1-0.448,1-1s-0.448-1-1-1H18.503    L21.796,23.159z"/></g></g></svg>',
    //        onClick: this.props.onPreviousDocument,
    //        dataElement: "previousDocument",
    //        title: "Previous Document"
    //    });
    //    header.get("previousDocument").insertAfter({
    //        type: "actionButton",
    //        img:
    //        '<svg enable-background="new 0 0 48 48" height="24px" version="1.1" viewBox="0 0 48 48" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_3"><g><path d="M9.854,45h28c0.552,0,1-0.448,1-1V14c0-0.13-0.026-0.26-0.077-0.382c-0.051-0.122-0.124-0.233-0.216-0.325l-9.999-9.999    c-0.092-0.092-0.203-0.166-0.325-0.216C28.114,3.026,27.985,3,27.854,3h-18c-0.552,0-1,0.448-1,1v40    C8.854,44.552,9.302,45,9.854,45z M28.854,6.414L35.44,13h-6.586V6.414z M10.854,5h16v9c0,0.552,0.448,1,1,1h9v28h-26V5z"/><path d="M32.866,27.07c-0.051-0.122-0.124-0.233-0.216-0.325l-5-5c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414    l3.293,3.293H15.943c-0.552,0-1,0.448-1,1s0.448,1,1,1h13.586l-3.293,3.293c-0.391,0.391-0.391,1.023,0,1.414    c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l5-5c0.092-0.092,0.166-0.203,0.216-0.325    C32.967,27.59,32.967,27.314,32.866,27.07z"/></g></g></svg>',
    //        onClick: this.props.onNextDocument,
    //        dataElement: "nextDocument",
    //        title: "Next Document"
    //    });
    //    header.get("nextDocument").insertAfter({
    //        type: "actionButton",
    //        img:
    //        '<svg enable-background="new 0 0 48 48" height="24px" version="1.1" viewBox="0 0 48 48" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_3"><g><path d="M10,45h28c0.553,0,1-0.448,1-1V14c0-0.13-0.026-0.26-0.077-0.382c-0.051-0.123-0.124-0.233-0.217-0.326l-9.998-9.999    c-0.093-0.093-0.203-0.166-0.326-0.217C28.26,3.026,28.13,3,28,3H10C9.448,3,9,3.448,9,4v40C9,44.552,9.448,45,10,45z M29,6.414    L35.586,13H29V6.414z M11,5h16v9c0,0.552,0.447,1,1,1h9v28H11V5z"/><path d="M28.382,29.745l-3.293,3.293V19.452c0-0.552-0.448-1-1-1s-1,0.448-1,1v13.586l-3.293-3.293    c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l5,5c0.092,0.092,0.203,0.166,0.325,0.216    c0.123,0.051,0.252,0.077,0.382,0.077s0.26-0.026,0.382-0.077c0.122-0.051,0.233-0.124,0.325-0.216l5-5    c0.391-0.391,0.391-1.023,0-1.414S28.772,29.354,28.382,29.745z"/></g></g></svg>',
    //        onClick: this.props.onDownloadDocument,
    //        dataElement: "downloadDocument",
    //        title: "Download"
    //    });
    //  });
    //}

    const { disableNext, disablePrev } = this.props
    this.addCustomHeaders(disableNext, disablePrev)
  }

  documentLoadedHandler = () => {
    const instance = this.instance
    instance.openElements(["leftPanel", "thumbnailsPanel"])
    instance.setFitMode(instance.FitMode.FitWidth)
  }

  getInstance = () => {
    return this.instance
  }

  // getWindow() {
  //   return this.viewer.current.querySelector("iframe").contentWindow;
  // }

  getElement() {
    return this.docViewer
  }

  render() {
    return <div className="webViewer" ref={this.viewer} />
  }
}

WebViewer.propTypes = propTypes
WebViewer.defaultProps = defaultProps

export default WebViewer
