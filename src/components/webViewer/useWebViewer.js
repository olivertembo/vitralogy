import { useState, useEffect } from "react"
import "./WebViewer.css"

const licenseKey =
  "Vitralogy LLC(vitralogy.com):OEM:Virtual Binder::B+:AMS(20200410):86A54FFD0457460A3360B13AC982535860617F95A9266A5BDB1C9409AD3470F054AA31F5C7"

function useWebViewer({ ref, options = {} }) {
  const [webViewer, setWebViewer] = useState(null)

  useEffect(() => {
    const node = ref.current
    const wv = new window.PDFTron.WebViewer(
      {
        path: "/webviewer/lib",
        l: licenseKey,
        // documentType options:
        //   xod - default
        //   pdf - pdf and images
        //   office - office docs only
        //   all - pdf + office
        documentType: options.documentType || "all",
        disabledElements: options.disabledElements || [
          "notesPanelButton",
          "notesPanel",
          "downloadButton",
          "toolsButton",
        ],
      },
      node,
    )
    setWebViewer(wv)
  }, [ref])

  const getInstance = () => webViewer.getInstance()

  const getElement = () => ref.current

  const getWindow = () => ref.current.querySelector("iframe").contentWindow

  return { webViewer, getElement, getInstance, getWindow }
}

export { useWebViewer }
