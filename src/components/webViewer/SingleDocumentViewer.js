import React from "react"
import Button from "react-bootstrap/lib/Button"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import ButtonGroup from "react-bootstrap/lib/ButtonGroup"
import { useWebViewer } from "./useWebViewer"

function SingleDocumentViewer({ file, uniqueId, fileName, auth }) {
  const webViewerNode = React.useRef()

  const { webViewer, getElement, getInstance } = useWebViewer({
    ref: webViewerNode,
  })

  React.useEffect(() => {
    if (webViewer !== null) {
      getElement().addEventListener("ready", wvReadyHandler)
    }

    return () => {
      getElement().removeEventListener("ready", wvReadyHandler)
    }
  }, [webViewer])

  function onDownloadFile() {
    auth.downloadFile(file, fileName)
  }

  function customButtons() {
    const formatter = (
      <ButtonToolbar>
        <ButtonGroup>
          <Button onClick={onDownloadFile}>Download Document</Button>
        </ButtonGroup>
      </ButtonToolbar>
    )
    return formatter
  }

  function wvReadyHandler() {
    const wv = getInstance()

    wv.disableTools()
    wv.openElements(["leftPanel", "thumbnailsPanel"])
    wv.setFitMode(wv.FitMode.FitWidth)
    wv.useEmbeddedPrint(false) // disable embedded printing

    if (auth) {
      wv.setHeaderItems(header => {
        header.get("zoomInButton").insertAfter({
          type: "divider",
          dataElement: "divider",
        })
        header.get("divider").insertAfter({
          type: "customElement",
          render: customButtons,
        })
      })
    }

    wv.loadDocument(file, {
      documentId: uniqueId,
      filename: fileName,
    })
  }

  return <div className="webViewer" ref={webViewerNode} />
}

export default SingleDocumentViewer
