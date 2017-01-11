import React from "react"
import PropTypes from "prop-types"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"

import { format } from "../../../utils/datetime"

const propTypes = {
  data: PropTypes.array.isRequired,
}

const defaultProps = {
  data: [],
}

const CriticalJobRow = ({ ...props }) => {
  const { data } = props

  const dateFormatter = (cell, row) => {
    const formattedDate = format(cell, "MM/DD/YYYY")
    let color = "green"

    switch (row.StatusName) {
      case "Upcoming":
        color = "#f0ad4e"
        break
      case "Active":
        color = "green"
        break
      case "Completed":
        color = "black"
        break
      default:
    }

    let status = <span style={{ color: `${color}` }}>{row.StatusName}</span>

    return (
      <span>
        {formattedDate}
        {" - "}
        {status}
        {" for "}
        <strong>{row.Asset}</strong>
      </span>
    )
  }

  if (data) {
    return (
      <div>
        <BootstrapTable data={data} trClassName="break-word">
          <TableHeaderColumn dataField="JobId" isKey={true} hidden={true}>
            ActiveVendorUserId
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ScheduledDate"
            dataFormat={dateFormatter}
          >
            Critical Dates
          </TableHeaderColumn>
          <TableHeaderColumn dataField="StatusName" hidden={true} />
          <TableHeaderColumn dataField="Asset" hidden={true} />
        </BootstrapTable>
      </div>
    )
  }

  return <div />
}

CriticalJobRow.propTypes = propTypes
CriticalJobRow.defaultProps = defaultProps

export default CriticalJobRow
