import React from "react"
import { camelizeKeys } from "humps"
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer"
import { List } from "react-virtualized/dist/commonjs/List"
import Panel from "react-bootstrap/lib/Panel"
import Icon from "react-fa/lib/Icon"
import { Redirect } from "react-router-dom"
import SiteHeader from "./SiteHeader"
import DateHeader from "./DateHeader"
import LineItemHeader from "./LineItemHeader"
import LineItem from "./LineItem"
import ProofModal from "./proofModal"
import CommentModal from "./commentModal"
import InvoiceFilters from "./InvoiceFilters"
import * as api from "../../constants/api"
import update from "immutability-helper"
import InvoiceLoader from "./InvoiceLoader"
import CloseInvoiceModal from "./CloseInvoiceModal"
import NoLineItems from "./NoLineItems"
import InvoiceHeader from "./InvoiceHeader"
import ToastHelper from "../../utils/ToastHelper"

const ROW_HEIGHT = 50

const getExpandedItemCount = item => {
  let count = 1
  if (item.expanded && "serviceDate" in item) {
    count = 2
  }

  if (item.expanded) {
    count += item.children.map(getExpandedItemCount).reduce((total, count) => {
      return total + count
    }, 0)
  }

  return count
}

export default class InvoiceDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      sites: [],
      hasError: null,
      showProofModal: false,
      selectedItem: null,
      showCommentModal: false,
      showCloseInvoice: false,
      filters: { filterSite: null, filterAuditStatus: 0, filterProofStatus: 0 },
      isLocked: props.location.state
        ? props.location.state.auditStatusId !==
          api.FMS_INVOICE_STATUS.PENDING_CUSTOMER_REVIEW
        : false,
    }

    this.List = React.createRef()
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    const { id } = this.props.match.params

    this.props.auth
      .request("post", api.GET_SITES_FOR_INVOICE(id))
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            const { sites } = json
            const expandableSites = sites.map(x => {
              x.expanded = false
              x.children = []
              return x
            })
            this.setState({
              sites: expandableSites,
              // filteredData: expandableSites,
            })
          } else {
            this.setState({ hasError: json.msg })
          }
        },
        () => {
          this.setState({ hasError: "Unable to load sites for this invoice" })
        },
      )
      .then(async () => {
        await Promise.all(
          this.state.sites.map(site => {
            return new Promise((resolve, reject) => {
              this.props.auth
                .request("post", api.GET_DATES_FOR_SITE(id, site.siteId))
                .then(
                  response => {
                    resolve({ siteId: site.siteId, response })
                  },
                  failure => {
                    reject(failure)
                  },
                )
            })
          }),
        ).then(responses => {
          let sites = []
          const { sites: currentSites } = this.state
          responses.forEach(item => {
            const resp = item.response
            if (resp.ok) {
              const json = camelizeKeys(resp.body)
              if (json.isSuccess) {
                const site = currentSites.find(x => x.siteId === item.siteId)

                if (site) {
                  let newSite = update(site, {
                    children: {
                      $set: json.dates.map(date => ({
                        serviceDate: date,
                        timeZone: json.timeZone,
                        timeZoneAbbr: json.abbreviation,
                        parentSiteId: site.siteId,
                        loaded: false,
                        children: [],
                      })),
                    },
                  })

                  sites.push(newSite)
                }
              }
            }
          })

          this.setState({
            sites,
            filteredData: sites,
          })
        })
      })
      .then(() => {
        this.setState({ isLoading: false })
      })
  }

  getLineItemData = (siteId, date) => {
    const { id: invoiceId } = this.props.match.params

    this.props.auth
      .request("post", api.GET_LINE_ITEMS_FOR_DATE(invoiceId, siteId))
      .send({ date })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            const { filteredData: currentSites } = this.state
            const siteIndex = currentSites.findIndex(x => x.siteId === siteId)
            const dateIndex = currentSites[siteIndex].children.findIndex(
              x => x.serviceDate === date,
            )
            const sites = update(currentSites, {
              [siteIndex]: {
                children: {
                  [dateIndex]: {
                    loaded: { $set: true },
                    expanded: { $set: true },
                    children: {
                      $set: json.lineItems.map(x => {
                        return { ...x, serviceDate: date }
                      }),
                    },
                  },
                },
              },
            })

            const filteredData = this.filterData(sites, this.state.filters)

            this.setState({ sites, filteredData }, () => {
              this.List.recomputeRowHeights()
              this.List.forceUpdate()
            })
          } else {
            this.setState({ hasError: json.msg })
          }
        },
        () => {
          this.setState({ hasError: "Unable to load sites for this invoice" })
        },
      )
  }

  postStatusChange = (item, action) => {
    const [siteIndex, dateIndex, lineItemIndex] = item.split("-")
    const site = this.state.sites[siteIndex]
    const date = site.children[dateIndex]
    const lineItem = date.children[lineItemIndex]

    const invoiceId = this.props.match.params.id
    this.props.auth
      .request("post", api.SNOW_PROOF_STATUS(invoiceId, lineItem.lineItemId))
      .query({ customerStatusId: action })
      .query({ serial: lineItem.serial })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            this.getLineItemData(site.siteId, date.serviceDate)
          } else {
            this.setState({ hasError: json.msg })
          }
        },
        () => {
          this.setState({
            hasError: "Unable to change this line item's status",
          })
        },
      )
  }

  handleHideProofModal = updateLineItems => {
    if (updateLineItems) {
      const { siteIndex, dateIndex } = this.state.selectedItem.indexes
      const site = this.state.sites[siteIndex]
      const date = site.children[dateIndex]

      this.getLineItemData(site.siteId, date.serviceDate)
    }

    this.setState({ showProofModal: false, selectedItem: null })
  }

  handleShowCloseInvoice = () => {
    this.setState({ showCloseInvoice: true })
  }

  handleHideCloseInvoice = (success, msg) => {
    // if (success) {
    //   ToastHelper.success("Invoice closed successfully.")
    // } else {
    //   ToastHelper.error(`Error closing invoice${msg ? `: ${msg}` : "."}`)
    // }
    this.setState({ showCloseInvoice: false })
  }

  handleFilterChanged = filters => {
    const filteredData = this.filterData(this.state.sites, filters)

    this.setState({ filters, filteredData }, () => {
      this.List.recomputeRowHeights()
      this.List.forceUpdate()
    })
  }

  filterData = (rawData, filters) => {
    const { filterSite, filterAuditStatus, filterProofStatus } = filters
    let filteredData = [...rawData]
    if (filterSite && filterSite.length > 0) {
      const lowerSearchText = filterSite.toLowerCase()
      filteredData = filteredData.filter(
        x =>
          x.siteName.toLowerCase().includes(lowerSearchText) ||
          x.siteAddress.toLowerCase().includes(lowerSearchText),
      )
    }

    if (filterAuditStatus > 0) {
      // go through loaded line items
      // map based off the audit status
      filteredData = filteredData.map(site => ({
        ...site,
        children: site.children.map(date => ({
          ...date,
          children: date.children.filter(
            line => line.auditStatusId === filterAuditStatus,
          ),
        })),
      }))
    }

    if (filterProofStatus !== 0) {
      let fixNullValue = filterProofStatus === -1 ? null : filterProofStatus
      filteredData = filteredData.map(site => ({
        ...site,
        children: site.children.map(date => ({
          ...date,
          children: date.children.filter(
            line => line.proofStatusId === fixNullValue,
          ),
        })),
      }))
    }

    return filteredData
  }

  _rowHeight = params => {
    const { filteredData } = this.state
    return getExpandedItemCount(filteredData[params.index]) * ROW_HEIGHT
  }

  _cellRenderer = params => {
    const { filteredData } = this.state
    const renderedCell = this._renderItem(
      filteredData[params.index],
      params.index,
    )

    return <Panel key={params.key}>{renderedCell}</Panel>
  }

  _onActionClick = (item, action) => {
    const [siteIndex, dateIndex, lineItemIndex] = item.split("-")
    const site = this.state.filteredData[siteIndex]
    const date = site.children[dateIndex]
    const lineItem = date.children[lineItemIndex]

    const title = `${site.siteName} - ${date.serviceDate} - ${
      lineItem.service
    } - #${lineItem.lineItemNumber}`

    const selectedItem = {
      ...lineItem,
      invoiceId: this.props.match.params.id,
      indexes: { siteIndex, dateIndex, lineItemIndex },
      title,
    }

    if (action === -1) {
      this.setState({
        showProofModal: true,
        selectedItem,
      })
    } else if (
      action === api.FMS_PROOF_STATUS.APPROVED ||
      action === api.FMS_PROOF_STATUS.NOT_APPROVED ||
      action === api.FMS_PROOF_STATUS.ADDITIONAL_PROOF_NEEDED
    ) {
      ToastHelper.success("Submitting response...")
      this.postStatusChange(item, action)
    }
  }

  _onCommentsClick = item => {
    const [siteIndex, dateIndex, lineItemIndex] = item.split("-")
    const site = this.state.filteredData[siteIndex]
    const date = site.children[dateIndex]
    const lineItem = date.children[lineItemIndex]

    const title = `${site.siteName} - ${date.serviceDate} - ${
      lineItem.service
    } - #${lineItem.lineItemNumber}`

    const selectedItem = {
      ...lineItem,
      invoiceId: this.props.match.params.id,
      title,
    }

    this.setState({ showCommentModal: true, selectedItem })
  }

  _renderItem = (item, keyPrefix) => {
    const onClick = event => {
      event.stopPropagation()
      // TODO this needs to update filterData
      item.expanded = !item.expanded

      // Check if line items have been loaded
      if ("serviceDate" in item && item.loaded === false) {
        this.getLineItemData(item.parentSiteId, item.serviceDate)
      }

      this.List.recomputeRowHeights()
      this.List.forceUpdate()
    }

    const props = { key: keyPrefix }
    let children = []
    let itemNode = null
    const isSite = "siteName" in item

    itemNode = isSite ? (
      <SiteHeader
        name={item.siteName}
        address={item.siteAddress}
        expanded={item.expanded}
      />
    ) : (
      <DateHeader date={item.serviceDate} expanded={item.expanded} />
    )

    if (item.expanded) {
      props.onClick = onClick

      children = item.children.map((child, index) => {
        return this._renderItem(child, keyPrefix + "-" + index)
      })

      // Add a header row if this is an expanded date item
      if (isSite === false) {
        if (item.loaded === false) {
          children.unshift(
            <span className="line-item-loading" key={`${keyPrefix}-loading`}>
              <Icon name="spinner" spin /> Loading line items...
            </span>,
          )
        } else {
          const hasChildren = item.children && item.children.length > 0
          if (hasChildren) {
            children.unshift(<LineItemHeader key={`${keyPrefix}-header`} />)
          } else {
            children.unshift(<NoLineItems />)
          }
        }
      }
    } else if (item.children) {
      props.onClick = onClick
    } else {
      const rowClick = event => {
        event.stopPropagation()
      }
      props.onClick = rowClick

      itemNode = (
        <LineItem
          indexes={keyPrefix}
          item={item}
          onActionClick={this._onActionClick}
          onCommentsClick={this._onCommentsClick}
          disabled={this.state.isLocked}
        />
      )
    }

    children.unshift(<div key="label">{itemNode}</div>)

    return <div {...props}>{children}</div>
  }

  render() {
    const { state } = this.props.location
    if (!state) {
      return <Redirect to="/invoices" />
    }

    const { hasError, filteredData, isLoading } = this.state
    if (isLoading) {
      return <InvoiceLoader />
    }

    if (hasError) {
      return <div className="invoice-list">error: {hasError}</div>
    }

    return (
      <div className="invoice-detail">
        <InvoiceHeader data={state} />
        {this.state.showCloseInvoice && (
          <CloseInvoiceModal
            auth={this.props.auth}
            title={`Close Invoice ${state.invoiceNumber}`}
            show={this.state.showCloseInvoice}
            onHide={this.handleHideCloseInvoice}
            serial={this.props.location.state.serial}
            invoiceId={this.props.match.params.id}
          />
        )}
        {this.state.showProofModal && (
          <ProofModal
            auth={this.props.auth}
            title={this.state.selectedItem.title}
            show={this.state.showProofModal}
            onHide={this.handleHideProofModal}
            item={this.state.selectedItem}
            disabled={this.state.isLocked}
          />
        )}
        {this.state.showCommentModal && (
          <CommentModal
            auth={this.props.auth}
            title={this.state.selectedItem.title}
            show={this.state.showCommentModal}
            onHide={() => {
              this.setState({ showCommentModal: false, selectedItem: null })
            }}
            item={this.state.selectedItem}
          />
        )}
        <InvoiceFilters
          onFiltersChanged={this.handleFilterChanged}
          onCloseInvoice={this.handleShowCloseInvoice}
          disabled={this.state.isLocked}
        />
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={list => {
                this.List = list
              }}
              width={width}
              height={height}
              overscanRowCount={10}
              rowHeight={this._rowHeight}
              rowRenderer={this._cellRenderer}
              rowCount={filteredData.length}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}
