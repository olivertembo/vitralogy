import React from "react"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import { AutoSizer } from "react-virtualized"
import Icon from "react-fa/lib/Icon"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import ButtonGroup from "react-bootstrap/lib/ButtonGroup"
import { Document, Page } from "react-pdf"
import ShadowScrollbars from "./ShadowScrollbars"
import OverlayButton from "../layout/OverlayButton"
import EmptyMessage from "./EmptyMessage"
import BinderListView from "./BinderListView"

const propTypes = {}

const defaultProps = {}

const VIEW_MODE = {
  DOCUMENTS: 1,
  LIST: 2,
}

export default class LandscapeBinder extends React.Component {
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

    const { showToolbar, viewingFileNumPages, viewingFilePage } = this.state

    const numTabItems = contentItems[selectedKey].length
    const currentEntry = entries.find(x => x.tAG === selectedKey)
    const tabName = currentEntry.vBinderName
    const binderBorderStyle = {
      borderColor: currentEntry.cssStyle.binderContentBackground,
    }

    return (
      <Row className="clearfix">
        <Col
          sm={3}
          md={2}
          className="binder-tabs-container"
          style={{ height: "100%" }}
        >
          <AutoSizer disableWidth>
            {({ height }) => (
              <ShadowScrollbars style={{ width: "100%", height: height }}>
                <ul className="nav nav-pills nav-stacked">
                  {entries.map(entry => {
                    const {
                      binderSelectedBackground,
                      binderSelectedText,
                      binderNotSelectedBackground,
                      binderNotSelectedText,
                    } = entry.cssStyle
                    const activeStyle = {
                      backgroundColor: binderSelectedBackground,
                      color: binderSelectedText,
                    }
                    const inactiveStyle = {
                      backgroundColor: binderNotSelectedBackground,
                      color: binderNotSelectedText,
                    }
                    const active = selectedKey === entry.tAG
                    return (
                      <li
                        // className={TAB_COLORS[entry.tAG]}
                        key={entry.tAG}
                        className={active ? "active" : null}
                      >
                        <a
                          href="/"
                          style={active ? activeStyle : inactiveStyle}
                          onClick={e => {
                            e.preventDefault()
                            this.props.onTabSelected(entry.tAG)
                          }}
                        >
                          {entry.vBinderName}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </ShadowScrollbars>
            )}
          </AutoSizer>
        </Col>
        <Col
          sm={9}
          md={10}
          className="binder-content"
          style={binderBorderStyle}
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
              <AutoSizer disableWidth>
                {({ height }) => (
                  <React.Fragment>
                    {(showToolbar === true ||
                      docModeData.current.data === null) && (
                      <ButtonToolbar className="binder flex-center">
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
                            disabled={docModeData.index === docModeData.numDocs}
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
                          height={height - 100}
                          renderMode="svg"
                          pageNumber={viewingFilePage}
                        />
                      </Document>
                    )}
                    {docModeData.current.data === null &&
                      docModeData.current.error === false && (
                        <div style={{ height: height - 50 }}>
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
                        <div style={{ height: height - 50 }}>
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
    )
  }
}

LandscapeBinder.propTypes = propTypes
LandscapeBinder.defaultProps = defaultProps
