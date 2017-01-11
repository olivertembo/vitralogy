import React from "react"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import { AutoSizer } from "react-virtualized"
import Icon from "react-fa/lib/Icon"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import ButtonGroup from "react-bootstrap/lib/ButtonGroup"
import { Document, Page } from "react-pdf"
import Select from "react-select"
import OverlayButton from "../layout/OverlayButton"
import EmptyMessage from "./EmptyMessage"
import BinderListView from "./BinderListView"

const propTypes = {}

const defaultProps = {}

const VIEW_MODE = {
  DOCUMENTS: 1,
  LIST: 2,
}

export default class PortraitBinder extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showToolbar: false,
      viewingFilePage: props.viewingFilePage,
      viewingFileNumPages: 0,
    }
  }

  componentDidUpdate(prevProps) {
    const { viewingFilePage } = this.props
    if (prevProps.viewingFilePage !== viewingFilePage) {
      this.setState({ viewingFilePage })
    }
  }

  onSelectTab = tab => {
    this.props.onTabSelected(tab.value)
  }

  onFullscreenClick = () => {
    this.props.onFullscreenClick(this.state.viewingFilePage)
  }

  render() {
    const {
      docModeData,
      viewMode,
      contentItems,
      selectedKey,
      entries,
      isViewingFile,
      docItems,
    } = this.props

    const tabOptions = entries.map(entry => {
      return { label: entry.vBinderName, value: entry.tAG }
    })

    const { showToolbar, viewingFileNumPages, viewingFilePage } = this.state

    const numTabItems = contentItems[selectedKey].length
    const currentEntry = entries.find(x => x.tAG === selectedKey)
    const tabName = currentEntry.vBinderName

    return (
      <div className="binder-portrait">
        <Row>
          <Col md={12} className="mb-md">
            <Select
              name="tab-options"
              options={tabOptions}
              onChange={this.onSelectTab}
              value={selectedKey}
            />
          </Col>
        </Row>
        <Row>
          <Col
            md={12}
            className="binder-content-portrait"
            hidden={isViewingFile}
          >
            {Object.keys(contentItems).length > 0 &&
              numTabItems > 0 &&
              viewMode === VIEW_MODE.LIST && (
                <BinderListView
                  selectedKey={selectedKey}
                  contentItems={contentItems}
                  onDownloadFile={this.props.onDownloadFile}
                  onPreviewFileClick={this.props.onPreviewFileClick}
                />
              )}

            {Object.keys(contentItems).length > 0 &&
              numTabItems > 0 &&
              viewMode === VIEW_MODE.DOCUMENTS &&
              docModeData.current !== null && (
                <AutoSizer disableHeight style={{ width: "auto" }}>
                  {({ width }) => (
                    <React.Fragment>
                      {(showToolbar === true ||
                        docModeData.current.data === null) && (
                        <ButtonToolbar className="binder flex-center mt-md">
                          <ButtonGroup>
                            <OverlayButton
                              glyph="backward"
                              text="Previous Document"
                              disabled={docModeData.index === 0}
                              onClick={this.props.onPrevDocClick}
                            />
                            <OverlayButton
                              glyph="triangle-left"
                              text="Previous Page"
                              disabled={viewingFilePage === 1}
                              onClick={() => {
                                this.setState({
                                  viewingFilePage: viewingFilePage - 1,
                                })
                              }}
                            />

                            <OverlayButton
                              glyph="triangle-right"
                              text="Next Page"
                              disabled={
                                viewingFilePage === viewingFileNumPages ||
                                docModeData.current.error === true
                              }
                              onClick={() => {
                                this.setState({
                                  viewingFilePage: viewingFilePage + 1,
                                })
                              }}
                            />
                            <OverlayButton
                              glyph="forward"
                              text="Next Document"
                              disabled={
                                docModeData.index === docModeData.numDocs
                              }
                              onClick={this.props.onNextDocClick}
                            />
                          </ButtonGroup>
                          <ButtonGroup>
                            <OverlayButton
                              disabled={docModeData.current.error === true}
                              text="Download File"
                              onClick={() => {
                                const { docItems, selectedKey } = this.props
                                const currentItem =
                                  docItems[selectedKey][docModeData.index]
                                this.props.onDownloadFile(
                                  currentItem.data.name,
                                  currentItem.data.url,
                                )
                              }}
                            >
                              <Icon name="file-pdf-o" />
                            </OverlayButton>
                            <OverlayButton
                              glyph="list"
                              text="Show List View"
                              onClick={this.props.onShowListViewClick}
                            />
                            <OverlayButton
                              disabled={
                                docModeData.current.data === null ||
                                docModeData.current.error === true
                              }
                              glyph="search"
                              text="View Document Fullscreen"
                              onClick={this.onFullscreenClick}
                            />
                          </ButtonGroup>
                        </ButtonToolbar>
                      )}

                      {docModeData.current.data !== null && (
                        <Document
                          onClick={this.onFullscreenClick}
                          className="binder flex-center"
                          file={docModeData.current.data}
                          onLoadSuccess={pdf => {
                            this.setState({
                              viewingFileNumPages: pdf.numPages,
                              viewingFilePage: 1,
                              showToolbar: true,
                            })
                          }}
                          loading={
                            <EmptyMessage>
                              <Icon name="spinner" size="5x" spin />
                              &nbsp;Loading document...
                            </EmptyMessage>
                          }
                          renderMode="svg"
                          renderTextLayer={false}
                        >
                          <Page
                            width={width - 50}
                            renderMode="svg"
                            pageNumber={viewingFilePage}
                          />
                        </Document>
                      )}
                      {docModeData.current.data === null &&
                        docModeData.current.error === false && (
                          <div style={{ width: width - 50 }}>
                            <EmptyMessage
                              icon="file-text"
                              title={
                                docItems[selectedKey][docModeData.index].text
                              }
                            >
                              <p>
                                This file cannot be previewed at this time, use
                                the download button below to retrieve the file.
                              </p>
                            </EmptyMessage>
                          </div>
                        )}

                      {docModeData.current.data === null &&
                        docModeData.current.error === true && (
                          <div style={{ width: width - 50 }}>
                            <EmptyMessage
                              icon="times-circle"
                              title={
                                docItems[selectedKey][docModeData.index].text
                              }
                            >
                              <p>
                                This file seems to be missing. Please try again
                                later.
                              </p>
                            </EmptyMessage>
                          </div>
                        )}
                    </React.Fragment>
                  )}
                </AutoSizer>
              )}

            {Object.keys(contentItems).length > 0 && numTabItems === 0 && (
              <React.Fragment>
                <EmptyMessage icon="folder" title="No data found!">
                  <p>
                    No records are filed under &quot;
                    {tabName}
                    &quot;
                  </p>
                </EmptyMessage>
              </React.Fragment>
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

PortraitBinder.propTypes = propTypes
PortraitBinder.defaultProps = defaultProps
