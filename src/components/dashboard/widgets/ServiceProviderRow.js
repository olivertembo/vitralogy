import React from "react"
import PropTypes from "prop-types"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Icon from "react-fa/lib/Icon"

import JobFriendlyName from "../../jobs/JobFriendlyName"

const propTypes = {
  data: PropTypes.array.isRequired,
}

const defaultProps = {
  data: [],
}

export default class ServiceProviderRow extends React.Component {
  constructor(props) {
    super(props)

    this.correctiveFormatter = this.correctiveFormatter.bind(this)
  }

  correctiveFormatter(cell, row) {
    const friendlyName = (
      <JobFriendlyName
        name={row.AStep_Name}
        shortName={row.AStep_ShortName}
        siteShortName={row.ASiteAStep_ShortName}
        description={row.AStep_Description}
        siteDescription={row.ASiteAStep_Description}
      />
    )

    const toolTip = (
      <Tooltip id="correctiveToolTip">{`Corrective Action Job`}</Tooltip>
    )

    const formatter = row.IsCorrectiveAction ? (
      <OverlayTrigger overlay={toolTip} placement="top">
        <span className="issue">
          <Icon name="wrench" />
          &nbsp;{friendlyName}
        </span>
      </OverlayTrigger>
    ) : (
      friendlyName
    )

    return formatter
  }

  render() {
    if (this.props.data) {
      return (
        <div>
          <BootstrapTable data={this.props.data} trClassName="break-word">
            <TableHeaderColumn
              dataField="ActiveVendorUserId"
              isKey={true}
              hidden={true}
            >
              ActiveVendorUserId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ActiveVendorUser">
              User
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="AStep_Name"
              dataFormat={this.correctiveFormatter}
              dataAlign="center"
            >
              Type
            </TableHeaderColumn>
            <TableHeaderColumn dataField="AStep_ShortName" hidden>
              AStep_ShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ASiteAStep_ShortName" hidden>
              ASiteAStep_ShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="AStep_Description" hidden>
              AStep_Description
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ASiteAStep_Description" hidden>
              ASiteAStep_Description
            </TableHeaderColumn>
            <TableHeaderColumn dataField="IsCorrectiveAction" hidden>
              IsCorrectiveAction
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="RecordsCount"
              dataAlign="center"
              width="20%"
            >
              Completed
            </TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }

    return <div />
  }
}

ServiceProviderRow.propTypes = propTypes
ServiceProviderRow.defaultProps = defaultProps
