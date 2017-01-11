import React from "react"
import { List, AutoSizer } from "react-virtualized"
import RowItem from "./RowItem"

export default class BinderListView extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps.selectedKey !== this.props.selectedKey) {
      if (this.list) {
        this.list.forceUpdateGrid()
      }
    }
  }

  renderRow = ({ index, key, style }) => {
    const item = this.props.contentItems[this.props.selectedKey][index]
    const computedStyle = {
      ...style,
      backgroundColor: item.backgroundColor,
      color: item.color,
    }
    const uniqueKey = `${this.props.selectedKey}-${key}`
    return (
      <RowItem
        item={item}
        key={uniqueKey}
        style={computedStyle}
        downloadFile={this.props.onDownloadFile}
        previewFile={this.props.onPreviewFileClick}
      />
    )
  }

  render() {
    const { contentItems, selectedKey } = this.props

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            height={768} // list height
            rowHeight={50} // row height
            width={width} // row width
            rowRenderer={this.renderRow}
            rowCount={contentItems[selectedKey].length}
            ref={list => {
              this.list = list
            }}
          />
        )}
      </AutoSizer>
    )
  }
}
