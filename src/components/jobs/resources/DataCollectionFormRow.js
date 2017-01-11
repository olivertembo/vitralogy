import React, { Component } from "react"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import request from "superagent"
import * as api from "../../../constants/api"
import moment from "moment"
import { format } from "../../../utils/datetime"

function formattedDate(cell, row) {
  return format(cell, "l LT")
}

class DataCollectionFormRow extends Component {
  constructor(props) {
    super(props)

    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
  }

  viewLinkFormatter(cell, row) {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={() => this.props.onGetFile(row.FileName, row.Url)}>
            <Icon name="download" />
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  render() {
    if (this.props.data) {
      return (
        <div>
          <BootstrapTable auth={this.props.auth} data={this.props.data}>
            <TableHeaderColumn
              dataField="JobDataCollectionId"
              isKey={true}
              hidden={true}
            >
              JobDataCollectionId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CreatedBy">
              Created By
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CollectedOn"
              dataFormat={formattedDate}
            >
              Collected On
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="Download"
              dataFormat={this.viewLinkFormatter}
            >
              Actions
            </TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }

    return <div />
  }
}

export default DataCollectionFormRow
