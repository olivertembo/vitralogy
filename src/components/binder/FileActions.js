import React from "react"
import Button from "react-bootstrap/lib/Button"
import TooltipIcon from "../layout/TooltipIcon"
import Utils from "../../utils/Utils"

const FileActions = ({ filename, downloadFile, previewFile, url, item }) => {
  const { downloadFileName } = item.data
  const showPreview = Utils.binderPreviewerSupported(downloadFileName)
  return (
    <React.Fragment>
      <Button
        onClick={() => {
          console.log(downloadFileName)
          downloadFile(downloadFileName, url)
        }}
      >
        <TooltipIcon
          placement="top"
          name="download"
          text="Request file download"
        />
      </Button>
      {showPreview && (
        <Button
          onClick={() => {
            previewFile(item)
          }}
        >
          <TooltipIcon placement="top" name="search" text="Preview file" />
        </Button>
      )}
    </React.Fragment>
  )
}

export default FileActions
