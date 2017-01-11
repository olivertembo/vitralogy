import React from "react"
import FileActions from "./FileActions"

const RowItem = ({ item, style, downloadFile, previewFile }) => {
  const { isModel, isStep, isJob } = item

  if (isModel) {
    return (
      <div className="model-row" style={style}>
        <div className="content">
          <div>
            <h4 style={{ color: item.color }}>{item.text}</h4>
          </div>
        </div>
      </div>
    )
  }

  if (isStep) {
    return (
      <div className="step-row" style={style}>
        <div className="content">
          <div>
            <h5 style={{ color: item.color }}>{item.text}</h5>
          </div>
        </div>
      </div>
    )
  }

  if (isJob) {
    return (
      <div className="job-row" style={style}>
        <div className="content">
          <div style={{ color: item.color }}>
            <strong>{item.text}</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-row" style={style}>
      <div className="content">
        <div style={{ color: item.color }}>
          <FileActions
            url={item.data.url}
            filename={item.data.name}
            item={item}
            downloadFile={() => {
              downloadFile(item.data.name, item.data.url)
            }}
            previewFile={previewFile}
          />{" "}
          {item.text}
        </div>
      </div>
    </div>
  )
}

export default RowItem
