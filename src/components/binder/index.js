import React from "react"
import { camelizeKeys } from "humps"
import Icon from "react-fa/lib/Icon"
import { Row, Col, Button, ButtonToolbar, ProgressBar } from "react-bootstrap"
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer"
import { List } from "react-virtualized/dist/commonjs/List"
import ShadowScrollbars from "./ShadowScrollbars"
import RowItem from "./RowItem"
// import Cover from "./Cover"
// import LandscapeBinder from "./LandscapeBinder"
// import PortraitBinder from "./PortraitBinder"
import EmptyMessage from "./EmptyMessage"
import WebViewer from "../webViewer"
import dataUtils from "./utils"
import * as api from "../../constants/api"
import { parseAccountId } from "../../utils/jwtHelper"

const ORIENTATION = {
  LANDSCAPE: 1,
  PORTRAIT: 2,
}

const VIEW_MODE = {
  DOCUMENTS: 1,
  LIST: 2,
}

const readUploadedFileAsArrayBuffer = inputFile => {
  const temporaryFileReader = new FileReader()

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort()
      reject(new DOMException("Problem parsing input file."))
    }

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result)
    }
    temporaryFileReader.readAsArrayBuffer(inputFile)
  })
}

// const initialState = {
//   selectedSiteName: null,
//   selectedResourceName: null,
//   selectedYear: null,
//   binderSelected: false,
//   contentItems: [],
//   entries: [],
//   isLoadingTabs: false,
//   isLoadingTabContent: false,
//   isViewingFile: false,
//   // viewingFileUrl: null,
//   viewingFileData: null,
//   viewingFilePage: 1,
//   viewingFileNumPages: 0,
//   numSteps: 1,
//   stepCount: 0,
//   numContent: 0,
//   viewMode: VIEW_MODE.DOCUMENTS,
//   docModeData: { current: null, next: null, prev: null },
// }

export default class Binder extends React.Component {
  constructor(props) {
    super(props)

    // let orientation = ORIENTATION.PORTRAIT
    // const width = window.innerWidth
    // const height = window.innerHeight
    // if (width > height) {
    //   orientation = ORIENTATION.LANDSCAPE
    // }

    // this.state = { ...initialState, orientation }
    this.state = {
      contentItems: [],
      entries: [],
      isLoadingTabs: true,
      isLoadingTab: true,
      isLoadingTabContent: false,
      numSteps: 1,
      stepCount: 0,
      numContent: 0,
      viewMode: VIEW_MODE.DOCUMENTS,
      docModeData: {
        current: null,
        next: null,
        prev: null,
        index: 0,
        numDocs: 0,
      },
      wvReady: false,
      loadingDoc: false,
    }

    this.webViewer = React.createRef()
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize)

    const { siteId, templateId, resourceId, yearId } = this.props.match.params
    this.getBinders(siteId, templateId, resourceId, yearId)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize)
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.selectedKey !== this.state.selectedKey &&
      this.state.viewMode === VIEW_MODE.LIST
    ) {
      if (this.list) {
        this.list.forceUpdateGrid()
      }
    }

    if (prevState.wvReady === false && this.state.wvReady === true) {
      this.wvLoadDocument()
    }
  }

  onWindowResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    if (width > height) {
      this.setState({ orientation: ORIENTATION.LANDSCAPE })
    } else {
      this.setState({ orientation: ORIENTATION.PORTRAIT })
    }
  }

  wvLoadDocument = docModeData => {
    const { index, current } = docModeData || this.state.docModeData
    if (current && current.error === false) {
      const selectedDocItems = this.state.docItems[this.state.selectedKey]
      const meta = selectedDocItems[index].data

      let filename = meta.downloadFileName
      //if (meta.fileName) {
      //  filename = `${meta.fileName}`;
      //} else if (meta.name) {
      //  filename = `${meta.name}.${current.type}`;
      //} else {
      //  // show some kind of error page here?
      //}

      // VES-5254
      //  -- doesn't work in safari/chrome on iOS --
      //
      // current.data.arrayBuffer().then(content => {
      //   const file = new File([content], filename)
      //   this.webViewer.current.getInstance().loadDocument(file, {
      //     documentId: meta.id,
      //     filename,
      //   })
      // })

      readUploadedFileAsArrayBuffer(current.data).then(content => {
        const file = new File([content], filename)
        this.webViewer.current.getInstance().loadDocument(file, {
          documentId: meta.id,
          filename,
        })
      })
    }
  }

  wvReadyHandler = () => {
    this.setState({ wvReady: true })
  }

  getBinders = (
    accountSiteId,
    binderTemplateId,
    accountSiteResourceId,
    year,
  ) => {
    const token = window.localStorage.getItem("vas_token")
    const accountId = parseAccountId(token)

    let url = `${api.VIRTUAL_BINDER_ROOT}${accountId}`
    if (accountSiteId) {
      url = `${url}/${accountSiteId}`
    }
    if (accountSiteResourceId) {
      url = `${url}/${accountSiteResourceId}`
    }
    this.props.auth
      .request("get", url)
      .query({ binderTemplateId })
      .query({ pageNumber: 1 })
      .query({ rowsPerPage: 100 })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        const json = camelizeKeys(response.body)

        if (json.isSuccess) {
          const { entries } = json

          this.setState({
            entries,
            defaultActiveKey: entries[0].tAG,
            selectedKey: entries[0].tAG,
            isLoadingTab: true,
            numSteps: entries.length + 1,
            stepCount: 1,
          })
        }
      })
      .then(() => {
        this.getBinderContent(accountSiteId, accountSiteResourceId, year)
      })
      .then(() => {
        this.setState({
          isLoadingTab: false,
        })
      })
  }

  getBinderContent = async (accountSiteId, accountSiteResourceId, year) => {
    this.setState({ isLoadingTabContent: true, isLoadingTabs: false })

    const contentItems = {}
    const docItems = {}
    let numContent = 0

    await Promise.all(
      this.state.entries.map(x => {
        const binderId = x.vBinderId
        const key = x.tAG

        return new Promise((resolve, reject) => {
          this.props.auth
            .request("get", api.VIRTUAL_BINDER_CONTENT)
            .query({ pageNumber: 1 })
            .query({ rowsPerPage: 250 })
            .query({ accountSiteId })
            .query({ accountSiteResourceId })
            .query({ year })
            .query({ binderId })
            .then(
              response => {
                resolve({ [key]: response, style: x.cssStyle, tag: x.tAG })
              },
              failure => {
                reject(failure)
              },
            )
            .then(() => {
              this.setState({ stepCount: this.state.stepCount + 1 })
            })
        })
      }),
    )
      .then(responses => {
        responses.forEach(item => {
          const resp = item[item.tag]

          if (!resp.ok) {
            throw Error(resp.statusText)
          }

          const json = camelizeKeys(resp.body)
          if (json.isSuccess) {
            const data = dataUtils.flatten(json.modelGroups, item.style)
            const docData = dataUtils.flattenByDocs(
              json.modelGroups,
              item.style,
            )
            numContent += data.length
            contentItems[item.tag] = data
            docItems[item.tag] = docData
          }
        })

        this.setState({
          isLoadingTabContent: false,
          contentItems,
          numContent,
          docItems,
        })

        // check for empty binder, because then webviewer will not be rendered
        // if (this.state.entries.length !== 0 && this.state.numContent !== 0) {
        //   this.webViewer.current
        //     .getElement()
        //     .addEventListener("ready", this.wvReadyHandler)
        // }
      })
      .then(async () => {
        this.loadDocViewTab(this.state.selectedKey)
      })
  }

  loadDocViewTab = async (selectedKey, startingIndex) => {
    const index = startingIndex || 0
    const { docItems } = this.state
    const selectedDocItems = docItems[selectedKey]
    const totalDocs = selectedDocItems.length

    if (totalDocs > 0) {
      const prev =
        index === 0
          ? null
          : await this.getDocModeData(selectedDocItems[index - 1])
      const current = await this.getDocModeData(selectedDocItems[index])
      const next =
        index + 1 === totalDocs
          ? null
          : await this.getDocModeData(selectedDocItems[index + 1])

      this.setState(
        {
          docModeData: {
            prev,
            next,
            current,
            index,
            numDocs: totalDocs - 1,
          },
        },
        () => {
          if (this.state.wvReady) {
            this.wvLoadDocument()
          }
        },
      )
    } else {
      this.setState({
        index,
        numDocs: totalDocs - 1,
        docModeData: {
          prev: null,
          next: null,
          current: null,
          index: 0,
          numDocs: 0,
        },
      })
    }
  }

  getDocModeData = async docItem => {
    return new Promise(async (resolve, reject) => {
      let type = "unknown"
      let data = null
      let error = true
      const { downloadFileName, url } = docItem.data

      const extension = downloadFileName
        .toLowerCase()
        .substring(downloadFileName.lastIndexOf(".") + 1)

      if (
        extension === "pdf" ||
        extension === "gif" ||
        extension === "png" ||
        extension === "jpg" ||
        extension === "docx" ||
        extension === "doc" ||
        extension === "xlsx" ||
        extension === "xls" ||
        extension === "pptx"
      ) {
        type = extension
        try {
          data = await this.props.auth.getBlobData(url).then(resp => {
            return resp.body
          })
          error = false
        } catch (err) {
          error = true
        }
      }

      const result = { type, data, error }

      resolve(result)
    })
  }

  onDownloadDocClick = async () => {
    const { selectedKey, docItems, docModeData } = this.state
    const { index } = docModeData
    const selectedDocItems = docItems[selectedKey]
    const meta = selectedDocItems[index].data
    this.onDownloadFile(meta.name, meta.url)
  }

  onNextDocClick = async () => {
    const { selectedKey, docItems, docModeData } = this.state
    const selectedDocItems = docItems[selectedKey]
    const newDocModeData = {
      prev: docModeData.current,
      current: docModeData.next,
      next: null,
      index: docModeData.index + 1,
      numDocs: docModeData.numDocs,
    }

    this.setState({ docModeData: newDocModeData }, () => {
      this.wvLoadDocument(newDocModeData)
    })
    // TODO fix here (check doc out of range of num docs)
    if (newDocModeData.index < newDocModeData.numDocs) {
      this.setState({ loadingDoc: true })
      this.getDocModeData(selectedDocItems[newDocModeData.index + 1]).then(
        next => {
          const nextDocModeData = Object.assign({}, newDocModeData, { next })
          this.setState({ docModeData: nextDocModeData, loadingDoc: false })
        },
      )
    }
  }

  onPrevDocClick = async () => {
    const { selectedKey, docItems, docModeData } = this.state
    const selectedDocItems = docItems[selectedKey]
    const newDocModeData = {
      prev: null,
      current: docModeData.prev,
      next: docModeData.current,
      index: docModeData.index - 1,
      numDocs: docModeData.numDocs,
    }

    this.setState({ docModeData: newDocModeData }, () => {
      this.wvLoadDocument(newDocModeData)
    })

    if (newDocModeData.index > 0) {
      this.setState({ loadingDoc: true })
      this.getDocModeData(selectedDocItems[newDocModeData.index - 1]).then(
        prev => {
          const prevDocModeData = Object.assign({}, newDocModeData, { prev })
          this.setState({ docModeData: prevDocModeData, loadingDoc: false })
        },
      )
    }
  }

  onTabSelected = selectedKey => {
    this.setState({ selectedKey, isLoadingTab: true }, () => {
      if (this.state.docItems[selectedKey].length > 0) {
        this.loadDocViewTab(selectedKey).then(() => {
          this.setState({ isLoadingTab: false })
        })
      } else {
        this.setState({
          docModeData: {
            prev: null,
            next: null,
            current: null,
            index: 0,
            numDocs: 0,
          },
          isLoadingTab: false,
        })
      }
    })
  }

  onPreviewFile = data => {
    this.loadDocViewTab(this.state.selectedKey, data.fileIndex)
    this.setState({ viewMode: VIEW_MODE.DOCUMENTS })
  }

  closeBinder = () => {
    this.props.history.push("/binder")
  }

  onDownloadFile = (filename, url) => {
    this.props.auth.downloadFile(url, filename)
  }

  renderRow = ({ index, key, style }) => {
    const item = this.state.contentItems[this.state.selectedKey][index]
    const computedStyle = {
      ...style,
      backgroundColor: item.backgroundColor,
      color: item.color,
    }
    const uniqueKey = `${this.state.selectedKey}-${key}`
    return (
      <RowItem
        item={item}
        key={uniqueKey}
        style={computedStyle}
        downloadFile={this.onDownloadFile}
        previewFile={this.onPreviewFile}
      />
    )
  }

  render() {
    const {
      isLoadingTabContent,
      isLoadingTabs,
      isLoadingTab,
      entries,
      stepCount,
      numSteps,
      viewMode,
      docModeData,
      // isViewingFile,
      // viewingFilePage,
      // viewingFileNumPages,
      // showToolbar,
      // docItems,
    } = this.state

    const {
      selectedSiteName,
      selectedResourceName,
      selectedYear,
      isSeasonal
    } = this.props.location.state

    const bull = (
      <span
        style={{
          display: "inline-block",
          margin: "0 2px",
          transform: "scale(0.8)",
        }}
      >
        •
      </span>
    )

    const progress = (stepCount / numSteps) * 100.0

    if (isLoadingTabs || isLoadingTabContent) {
      return (
        <EmptyMessage icon="paper-plane" title="Loading virtual binder...">
          <p>Hang in there while we sort through all this digital paper.</p>
          <div className="col-md-4 col-md-offset-4">
            <ProgressBar active bsStyle="info" now={progress} />
          </div>
        </EmptyMessage>
      )
    }

    if (this.state.entries.length === 0 || this.state.numContent === 0) {
      return (
        <EmptyMessage icon="folder" title="Empty binder!">
          {" "}
          <p>
            {`${selectedSiteName}`} {bull}{" "}
            {selectedResourceName ? (
              <>
                {selectedResourceName} {bull}{" "}
              </>
            ) : (
              ""
            )}
            {selectedYear}
          </p>
          <Button bsStyle="primary" onClick={this.closeBinder}>
            Close Binder
          </Button>
        </EmptyMessage>
      )
    }

    const { contentItems, selectedKey, loadingDoc } = this.state

    const numTabItems = contentItems[selectedKey].length
    const currentEntry = entries.find(x => x.tAG === selectedKey)
    const tabName = currentEntry.vBinderName
    const binderBorderStyle = {
      borderColor: currentEntry.cssStyle.binderContentBackground,
    }

    const noRecords = Object.keys(contentItems).length > 0 && numTabItems === 0
    const disableNext = loadingDoc || docModeData.index === docModeData.numDocs
    const disablePrev = loadingDoc || docModeData.index === 0

    // const commonProps = {
    //   onNextDocClick: this.onNextDocClick,
    //   onPrevDocClick: this.onPrevDocClick,
    //   onTabSelected: this.onTabSelected,
    //   onShowListViewClick: this.onShowListViewClick,
    //   onFullscreenClick: this.onFullscreenClick,
    //   onPreviewFileClick: this.onPreviewFile,
    //   onDownloadFile: this.onDownloadFile,
    //   docModeData,
    //   viewMode,
    //   contentItems,
    //   selectedKey,
    //   entries,
    //   isViewingFile,
    //   viewingFilePage,
    //   viewingFileNumPages,
    //   docItems,
    //   showToolbar,
    // }

    return (
      <div className="virtual-binder">
        <Row>
          <Col sm={8} md={8}>
            <div className="media title-wrapper">
              <div
                className="media-left media-middle"
                onClick={this.closeBinder}
              >
                <span className="btn-close-binder" onClick={this.closeBinder}>
                  <i className="fa fa-arrow-left close-binder" />
                </span>
              </div>
              <div className="media-body">
                <h1>
                  {selectedSiteName}
                  <small>
                    {selectedResourceName ? (
                      <>
                        {selectedResourceName} {bull}{" "}
                      </>
                    ) : (
                      ""
                    )}
                    {selectedYear}
                    {isSeasonal && (<strong>
                      {" "}{bull}{" "}Seasonal{" "}{bull}
                    </strong>)}
                  </small>
                </h1>
              </div>
            </div>
          </Col>
          <Col sm={4} md={4}>
            <div className="media title-wrapper">
              <div className="media-body">
                <h1 className="need-help">
                  <Icon name="medkit" /> Need Support? Call 833-848-1100
                </h1>
              </div>
            </div>
          </Col>
        </Row>
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
                        cursor: isLoadingTab ? "wait" : "pointer",
                      }
                      const inactiveStyle = {
                        backgroundColor: binderNotSelectedBackground,
                        color: binderNotSelectedText,
                        cursor: isLoadingTab ? "wait" : "pointer",
                      }
                      const active = selectedKey === entry.tAG
                      return (
                        <li
                          // className={TAB_COLORS[entry.tag]}
                          key={entry.tAG}
                          className={active ? "active" : null}
                        >
                          <a
                            href="/"
                            style={active ? activeStyle : inactiveStyle}
                            onClick={e => {
                              if (isLoadingTab) {
                                e.preventDefault()
                              } else {
                                e.preventDefault()
                                this.onTabSelected(entry.tAG)
                              }
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
            hidden={this.state.isViewingFile}
          >
            {Object.keys(contentItems).length > 0 &&
              numTabItems > 0 &&
              viewMode === VIEW_MODE.LIST && (
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height} // list height
                      rowHeight={50} // row height
                      width={width} // row width
                      rowRenderer={this.renderRow}
                      rowCount={this.state.contentItems[selectedKey].length}
                      ref={list => {
                        this.list = list
                      }}
                    />
                  )}
                </AutoSizer>
              )}
            <AutoSizer>
              {({ height, width }) => (
                <>
                  <div
                    style={{
                      height: height - 10,
                      width: width - 10,
                      visibility:
                        noRecords ||
                        viewMode === VIEW_MODE.LIST ||
                        (docModeData.current &&
                          docModeData.current.data === null)
                          ? "hidden"
                          : "visible",
                    }}
                  >
                    <WebViewer
                      ref={this.webViewer}
                      onReady={this.wvReadyHandler}
                      enablePaging={true}
                      disableNext={disableNext}
                      disablePrev={disablePrev}
                      onNextDocument={this.onNextDocClick}
                      onPreviousDocument={this.onPrevDocClick}
                      onDownloadDocument={this.onDownloadDocClick}
                      onShowListView={() => {
                        this.setState({
                          viewMode: VIEW_MODE.LIST,
                          docModeData: {
                            current: null,
                            next: null,
                            prev: null,
                          },
                        })
                      }}
                    />
                  </div>
                  {noRecords === false &&
                    docModeData.current &&
                    docModeData.current.error === true && (
                      <div style={{ height: height - 50 }}>
                        <EmptyMessage
                          icon="times-circle"
                          title={
                            this.state.docItems[selectedKey][docModeData.index]
                              ? this.state.docItems[selectedKey][
                                  docModeData.index
                                ].data.name
                              : ""
                          }
                        >
                          <p>
                            This file seems to be missing. Please try again
                            later.
                          </p>
                          <ButtonToolbar>
                            <Button
                              onClick={this.onPrevDocClick}
                              disabled={disablePrev}
                            >
                              Previous Document
                            </Button>
                            <Button
                              bsStyle="primary"
                              onClick={this.onNextDocClick}
                              disabled={disableNext}
                            >
                              Next Document
                            </Button>
                          </ButtonToolbar>
                        </EmptyMessage>
                      </div>
                    )}
                </>
              )}
            </AutoSizer>
            {/* )} */}

            {noRecords === true && (
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
        {/* do orientation switching */}
        {/*this.state.orientation === ORIENTATION.LANDSCAPE && (
          <LandscapeBinder {...commonProps} />
        )*/}
        {/*this.state.orientation === ORIENTATION.PORTRAIT && (
          <PortraitBinder {...commonProps} />
        )*/}
      </div>
    )
  }
}
