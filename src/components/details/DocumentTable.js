import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import List from "antd/lib/list"
import Tooltip from "antd/lib/tooltip"
import ReactHtmlParser from "react-html-parser"

import EmptyStateContainer from "../../containers/EmptyStateContainer"
import OverlayButton from "../layout/OverlayButton"
import Utils from "../../utils/Utils"
import * as api from "../../constants/api"
import MomentFormatter from "../MomentFormatter"

const getState = state => {
  return {
    _site: { ...state.sites },
    _userAccounts: { ...state.userAccounts },
  }
}

const propTypes = {
  auth: PropTypes.object.isRequired,
  _site: PropTypes.object,
  scope: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
}

class DocumentTable extends React.Component {
  constructor(props) {
    super(props)

    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
    this.dateFormatter = this.dateFormatter.bind(this)
    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)

    this.state = {
      documents: [],
      isFetching: false,
    }
  }

  dateFormatter(cell, row) {
    const timezone = this.props._site.selectedDetails
      ? this.props._site.selectedDetails.SiteTimeZoneShortName
      : null
    var formatDate = cell ? (
      <MomentFormatter
        datetime={cell}
        formatter="MM/DD/YYYY h:mm A"
        timezone={timezone}
      />
    ) : (
      ""
    )

    return formatDate
  }

  viewLinkFormatter(cell, row) {
    const tooltip = row.Description
      ? `${row.Description}, click to download`
      : `Click to download`

    return (
      <OverlayButton
        bsStyle={"link"}
        glyph=""
        disabled={false}
        text={tooltip}
        onClick={() => this.props.auth.downloadFile(row.Url, row.Name)}
      >
        {row.DocumentTypeName}
      </OverlayButton>
    )
  }

  uploadedByFormatter(cell, row) {
    const format = ` ${cell} from ${row.CreatedByName}`
    return format
  }

  componentDidMount() {
    this.getDocuments()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.scope === api.AccountScopeEnum.SITE) {
      if (this.props.site.AccountSiteId !== nextProps.site.AccountSiteId) {
        this.getDocuments(nextProps.site.AccountSiteId)
      }
    }
  }

  getDocuments(accountSiteId) {
    if (this.state.isFetching || this.props.data.AccountId === undefined) {
      return
    }

    if (accountSiteId === undefined) {
      if (this.props.scope === api.AccountScopeEnum.SITE) {
        accountSiteId = this.props.site.AccountSiteId
      } else {
        accountSiteId = null
      }
    }

    this.setState({ isFetching: true })

    //console.log(`Retrieving scope:${this.props.scope} documents for site#${accountSiteId}...`)

    this.props.auth
      .request("get", api.ACCOUNT_DOCUMENTS)
      .query({ isUseAccountSiteId: true })
      .query({ accountSiteId })
      .query({ accountId: this.props.data.AccountId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ documents: response.body.Documents })
          } else {
            console.log(
              `failed to get ${
                this.props.scope === api.AccountScopeEnum.SITE
                  ? "site"
                  : "account"
              } documents`,
            )
          }
        },
        () => {
          console.log(
            `failed to get ${
              this.props.scope === api.AccountScopeEnum.SITE
                ? "site"
                : "account"
            } documents`,
          )
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "resource-documents"

    const { _site, scope } = this.props

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />{" "}
          {scope === api.AccountScopeEnum.SITE
            ? "Fetching site documents..."
            : "Fetching account documents..."}
        </Alert>
      )
    }

    if (scope === api.AccountScopeEnum.SITE && _site.isLoadingDetails) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching site info...
        </Alert>
      )
    }

    if (
      this.state.documents === undefined ||
      this.state.documents.length === 0
    ) {
      const msg = (
        <div>
          {scope === api.AccountScopeEnum.SITE
            ? "No site documents."
            : "No account documents"}
        </div>
      )
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No documents uploaded for ${
              scope === api.AccountScopeEnum.SITE
                ? _site.selectedDetails.Name
                : "account"
            }!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <List
        grid={{ gutter: 8, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
        className={className}
        itemLayout="horizontal"
        pagination={{
          pageSize: 4,
          hideOnSinglePage: true,
        }}
        dataSource={this.state.documents}
        renderItem={item => (
          <List.Item key={item.DocumentId}>
            <List.Item.Meta
              avatar={
                <Tooltip
                  placement="topLeft"
                  title={
                    <span>
                      Click to download {ReactHtmlParser(item.Description)}
                    </span>
                  }
                >
                  <Icon
                    name={Utils.getFileTypeIcon(item.Name)}
                    style={{
                      fontSize: 85,
                      color: "#2e86c1",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      this.props.auth.downloadFile(item.Url, item.Name)
                    }
                  />
                </Tooltip>
              }
              description={
                <ul className="list-unstyled">
                  {/*
                                            <li>
                                                <strong>Type : </strong>{' '}
                                                <Tooltip placement="topLeft" title={`Click to download ${item.DocumentTypeName} - ${item.Description}`}>
                                                    <span
                                                        style={{ color: 'blue', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
                                                        onClick={() => this.props.auth.downloadFile(item.Url, item.Name)}
                                                    >
                                                        {item.DocumentTypeName}
                                                    </span>
                                                </Tooltip>
                                            </li>
                                         */}
                  {
                    <li>
                      <strong>Type : </strong> {item.DocumentTypeName}
                    </li>
                  }
                  <li>
                    <strong>File Name : </strong> {item.Name}
                  </li>
                  <li>
                    <strong>Uploaded On : </strong> {this.dateFormatter(item)}
                  </li>
                  <li>
                    <strong>Uploaded By : </strong>{" "}
                    {`${item.CreatedByName} from ${item.CreatedBy_AccountName}`}
                  </li>
                  <li>
                    <strong>Description : </strong>{" "}
                    {ReactHtmlParser(item.Description)}
                  </li>
                </ul>
              }
            />
          </List.Item>
        )}
      />
    )
  }
}

DocumentTable.propTypes = propTypes
DocumentTable.defaultProps = defaultProps

export default connect(getState)(DocumentTable)
