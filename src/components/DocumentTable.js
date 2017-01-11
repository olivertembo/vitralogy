import React from "react"
import { connect } from "react-redux"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"

import EmptyStateContainer from "../containers/EmptyStateContainer"
import ToastHelper from "../utils/ToastHelper"
import OverlayButton from "./layout/OverlayButton"
import * as api from "../constants/api"
import { format } from "../utils/datetime"

const getState = state => {
  return {
    _site: { ...state.site },
    _userAccounts: { ...state.userAccounts },
  }
}

const propTypes = {
  auth: PropTypes.object.isRequired,
  _site: PropTypes.object,
  id: PropTypes.number.isRequired,
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
    var formatDate = cell
      ? `${format(cell, "MM/DD/YYYY h:mm A")} ${
          this.props._site.details.SiteTimeZoneShortName
        }`
      : ""

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
    const format = ` ${cell} from ${row.CreatedBy_AccountName}`
    return format
  }

  componentDidMount() {
    this.getDocuments()
  }

  //componentWillReceiveProps(nextProps) {
  //    if (this.props.scope === api.AccountScopeEnum.SITE) {
  //        if (this.props._site.AccountSiteId != nextProps._site.AccountSiteId) {
  //            this.getDocuments(nextProps._site.AccountSiteId)
  //        }
  //    }
  //}

  getDocuments(accountSiteId) {
    if (this.state.isFetching || this.props.data.AccountSiteId === undefined) {
      return
    }

    if (accountSiteId === undefined) {
      if (this.props.scope === api.AccountScopeEnum.SITE) {
        accountSiteId = this.props.id
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
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess == true) {
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
    const options = {
      hideSizePerPage: true,
      noDataText: "No documents uploaded",
    }

    const { auth, _site, scope } = this.props

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
                ? _site.details.Name
                : "account"
            }!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <BootstrapTable
          data={this.state.documents}
          options={options}
          striped
          hover
          condensed
          trClassName="break-word"
        >
          <TableHeaderColumn dataField="DocumentId" isKey={true} hidden>
            Doc ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Url" hidden>
            Doc
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="CreatedByName"
            dataFormat={this.uploadedByFormatter}
          >
            {" "}
            Uploaded By
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CreatedBy_AccountName" hidden>
            {" "}
            Uploaded By Account
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Description">
            {" "}
            Description
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Name" hidden>
            FileName
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="DocumentTypeName"
            dataFormat={this.viewLinkFormatter}
            dataAlign="center"
          >
            Type
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

DocumentTable.propTypes = propTypes
DocumentTable.defaultProps = defaultProps

export default connect(getState)(DocumentTable)
