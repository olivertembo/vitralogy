import React from "react"
import PropTypes from "prop-types"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import { Label, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap"
import { Link } from "react-router"

export default class TeamListTable extends React.Component {
  constructor(props) {
    super(props)

    this.renderPaginationShowsTotal = this.renderPaginationShowsTotal.bind(this)
    this.flagFormatter = this.flagFormatter.bind(this)
    this.roleFormatter = this.roleFormatter.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
  }

  componentWillMount() {
    console.log(this.props)
  }

  roleFormatter(cell, row) {
    if (row.IsAdmin) return "Admin"

    return "Worker"
  }

  flagFormatter(cell, row, enumObject) {
    var style = cell ? "success" : "danger"

    return <Label bsStyle={style}>{enumObject[cell]}</Label>
  }

  renderPaginationShowsTotal(start, to, total) {
    return (
      <p style={{ color: "#337ab7" }}>
        Members {start} to {to} of {total}
      </p>
    )
  }

  viewLinkFormatter(cell, row) {
    const editToolTip = (
      <Tooltip id="editToolTip">{"Click to edit user " + row.Name}</Tooltip>
    )
    const deleteToolTip = (
      <Tooltip id="deleteToolTip">{"Click to remove user " + row.Name}</Tooltip>
    )

    return (
      <ButtonToolbar>
        <OverlayTrigger placement="left" overlay={editToolTip}>
          <Link to={"/team/edit/" + row.UserAccountId}>
            <Button bsStyle="primary" bsSize="xsmall">
              <i className="fa fa-pencil" />
            </Button>
          </Link>
        </OverlayTrigger>

        <OverlayTrigger placement="right" overlay={deleteToolTip}>
          <Button
            bsStyle="danger"
            bsSize="xsmall"
            onClick={() => this.props.onRemoveClick(row)}
          >
            <i className="fa fa-trash" />
          </Button>
        </OverlayTrigger>
      </ButtonToolbar>
    )
  }

  render() {
    const status = {
      true: "Yes",
      false: "No",
    }

    const options = {
      hideSizePerPage: true,
      noDataText: "No team members added",
      paginationShowsTotal: this.renderPaginationShowsTotal,
    }

    return (
      <BootstrapTable
        data={this.props.users}
        options={options}
        pagination
        striped
        hover
        condensed
      >
        <TableHeaderColumn
          dataField="UserAccountId"
          isKey={true}
          dataAlign="center"
          dataSort={true}
          hidden
        >
          ID
        </TableHeaderColumn>
        <TableHeaderColumn dataField="Name" dataSort={true}>
          Name
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="IsActive"
          dataFormat={this.flagFormatter.bind(this)}
          formatExtraData={status}
          dataSort={true}
          dataAlign="center"
        >
          Active
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="IsRegistered"
          dataFormat={this.flagFormatter.bind(this)}
          formatExtraData={status}
          dataSort={true}
          dataAlign="center"
        >
          Registered
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="IsAdmin"
          dataSort={true}
          dataFormat={this.roleFormatter.bind(this)}
        >
          Role
        </TableHeaderColumn>
        <TableHeaderColumn
          hidden={!this.props.showActions}
          dataField="viewLink"
          dataFormat={this.viewLinkFormatter.bind(this)}
        >
          Actions
        </TableHeaderColumn>
      </BootstrapTable>
    )
  }
}
