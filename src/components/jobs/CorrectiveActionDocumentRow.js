import React from "react"
import PropTypes from "prop-types"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import OverlayButton from "../layout/OverlayButton"
import { format } from "../../utils/datetime"

const propTypes = {
  data: PropTypes.array.isRequired,
  auth: PropTypes.object,
}

const defaultProps = {
  data: [],
  auth: {},
}

export default class CorrectiveActionDocumentRow extends React.Component {
  constructor(props) {
    super(props)

    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
  }

  uploadedByFormatter(cell, row) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {row.IsCreatedByMobile ? "Uploaded via mobile" : "Uploaded via web"}
      </Tooltip>
    )

    var msg =
      " " +
      cell +
      " on " +
      format(row.CreatedOn, "l LT") +
      " " +
      row.SiteTimeZoneShortName

    return (
      <p>
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon glyph={row.IsCreatedByMobile ? "phone" : "blackboard"} />
        </OverlayTrigger>
        {msg}
      </p>
    )
  }

  viewLinkFormatter(cell, row) {
    const tooltip = cell

    return (
      <OverlayButton
        bsStyle={"link"}
        glyph={row.IsPhoto ? "picture" : "file"}
        disabled={false}
        text={tooltip}
        onClick={() => this.props.auth.downloadFile(row.Url, row.FileName)}
      >
        {" "}
        {row.FileName}
      </OverlayButton>
    )
  }

  render() {
    if (this.props.data) {
      return (
        <div>
          <BootstrapTable data={this.props.data}>
            <TableHeaderColumn
              dataField="JobSourcingTierCorrectiveDocumentId"
              isKey={true}
              hidden={true}
            >
              JobSourcingTierCorrectiveDocumentId
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CreatedBy"
              dataFormat={this.uploadedByFormatter}
            >
              {" "}
              Uploaded By
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CreatedOn" hidden>
              Created On
            </TableHeaderColumn>
            <TableHeaderColumn dataField="IsCreatedByMobile" hidden>
              Mobile
            </TableHeaderColumn>
            <TableHeaderColumn dataField="Url" hidden>
              Url
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="FileName"
              dataFormat={this.viewLinkFormatter}
              dataAlign="center"
            >
              File
            </TableHeaderColumn>
            <TableHeaderColumn dataField="IsPhoto" hidden>
              IsPhoto
            </TableHeaderColumn>
            <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
              SiteTimeZoneShortName
            </TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }

    return <div />
  }
}

CorrectiveActionDocumentRow.propTypes = propTypes
CorrectiveActionDocumentRow.defaultProps = defaultProps
