import React, { Component } from "react"
import { Label, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap"
import { Link } from "react-router"
import Alert from "react-bootstrap/lib/Alert"
import { Icon } from "react-fa"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import SweetAlert from "react-bootstrap-sweetalert"

import * as api from "../../constants/api"
import ToastHelper from "../../utils/ToastHelper"
import SiteRoleAdd from "./SiteRoleAdd"

class SiteRoles extends Component {
  constructor(props) {
    super(props)

    this.state = {
      siteRoles: [],
      isLoading: false,
      alert: null,
      showAddRole: false,
      row: null,
    }

    this.handleOpenCloseAddRole = this.handleOpenCloseAddRole.bind(this)
    this.handleRoleSubmit = this.handleRoleSubmit.bind(this)
  }
  handleOpenCloseAddRole() {
    this.setState({
      row: null,
      showAddRole: !this.state.showAddRole,
    })
  }
  handleRoleSubmit(data) {
    //console.log('role submit:' + JSON.stringify(data))
    var roleType = this.refs.roleAdd.state.roleTypes.filter(function(i) {
      return i.ItemId === parseInt(data.roleTypeId)
    })
    let row = this.state.row
    let url = row === null ? api.SITE_ROLE_NEW : api.SITE_ROLE_EDIT
    var site = this.refs.roleAdd.state.sites.filter(function(i) {
      return i.AccountSiteId === parseInt(data.siteId)
    })

    this.props.auth
      .request("post", url)
      .query({ userAccountId: this.props.userAccountId })
      .query({ accountSiteId: data.siteId })
      .query({ contactRoleId: data.roleTypeId })
      .query({
        accountSiteContactId: row === null ? 0 : row.AccountSiteContactId,
      })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess == true) {
            var msg =
              row === null
                ? "Site role successfully added."
                : "Site role successfully updated."
            ToastHelper.success(msg)

            var siteRoles = this.state.siteRoles
            if (row === null) {
              var siteRole = {
                AccountSiteContactId: response.body.AccountSiteContactId,
                RoleTypeId: data.roleTypeId,
                SiteRole: roleType[0].Value,
                Name: site[0].Name,
                Address: site[0].Address,
              }
              var newSiteRole = siteRoles.concat([siteRole])
              this.setState({
                siteRoles: newSiteRole,
              })
            } else {
              var newSiteRoles = siteRoles.filter(function(i) {
                return (
                  i.AccountSiteContactId != parseInt(row.AccountSiteContactId)
                )
              })

              var siteRole = {
                AccountSiteContactId: row.AccountSiteContactId,
                RoleTypeId: data.roleTypeId,
                SiteRole: roleType[0].Value,
                Name: site[0].Name,
                Address: site[0].Address,
              }
              var newSiteRole = newSiteRoles.concat([siteRole])
              this.setState({
                siteRoles: newSiteRole,
              })
            }
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        failure => {
          var msg =
            row === null
              ? "Failed to add site role!"
              : "Failed to update site role!"
          ToastHelper.error(msg)
        },
      )
    this.setState({
      showAddRole: !this.state.showAddRole,
      row: null,
    })
  }
  handleConfirmClick(row) {
    console.log("Removing: " + row.SiteRole)
    let url = api.SITE_ROLE_REMOVE

    this.props.auth
      .request("post", url)
      .query({ userAccountId: this.props.userAccountId })
      .query({ accountSiteContactId: row.AccountSiteContactId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess == true) {
            ToastHelper.success(
              "Role " +
                row.SiteRole +
                " successfully removed from site " +
                row.Name,
            )

            var siteRoles = this.state.siteRoles
            var newSiteRoles = siteRoles.filter(function(i) {
              return (
                i.AccountSiteContactId != parseInt(row.AccountSiteContactId)
              )
            })
            this.setState({
              siteRoles: newSiteRoles,
            })
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        failure => {
          ToastHelper.error(
            "Failed to remove " +
              row.SiteRole +
              " role for site " +
              row.Name +
              "!",
          )
        },
      )
      .then(this.hideAlert())
  }
  editRole(row) {
    this.setState({
      row: row,
      showAddRole: !this.state.showAddRole,
    })
  }
  showAlert(row) {
    const getAlert = () => (
      <SweetAlert
        title="Remove Site Role"
        custom
        customIcon={require("../../assets/images/question.png")}
        showCancel
        confirmBtnText="Yes, Remove"
        confirmBtnBsStyle="danger"
        cancelBtnBsStyle="default"
        onConfirm={this.handleConfirmClick.bind(this, row)}
        onCancel={this.hideAlert.bind(this)}
      >
        {" "}
        {"Are you sure you wish to remove " +
          row.SiteRole +
          " role from site " +
          row.Name +
          "?"}
      </SweetAlert>
    )
    this.setState({ alert: getAlert() })
  }
  hideAlert() {
    this.setState({ alert: null })
  }
  viewLinkFormatter(cell, row) {
    const editToolTip = (
      <Tooltip id="editToolTip">{"Click to edit role " + row.SiteRole}</Tooltip>
    )
    const deleteToolTip = (
      <Tooltip id="deleteToolTip">{"Click to role " + row.SiteRole}</Tooltip>
    )
    return (
      <ButtonToolbar>
        <OverlayTrigger placement="left" overlay={editToolTip}>
          <Button
            bsStyle="primary"
            bsSize="xsmall"
            onClick={() => this.editRole(row)}
          >
            <i className="fa fa-pencil" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="right" overlay={deleteToolTip}>
          <Button
            bsStyle="danger"
            bsSize="xsmall"
            onClick={() => this.showAlert(row)}
          >
            <i className="fa fa-trash" />
          </Button>
        </OverlayTrigger>
      </ButtonToolbar>
    )
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.profile != undefined &&
      nextProps.profile.SiteRoles != undefined
    ) {
      this.setState({ siteRoles: nextProps.profile.SiteRoles })
    }
  }
  render() {
    const props = {
      userAccountId: this.props.userAccountId,
      auth: this.props.auth,
      onCloseClick: this.handleOpenCloseAddRole,
      onRoleSubmit: this.handleRoleSubmit,
    }
    return (
      <div className="site-roles">
        {this.state.isLoading && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" /> Loading site roles...
          </Alert>
        )}

        {this.state.alert}

        {this.state.showAddRole && (
          <SiteRoleAdd
            ref="roleAdd"
            show={this.state.showAddRole}
            {...props}
            row={this.state.row}
          />
        )}

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            bsSize="small"
            onClick={this.handleOpenCloseAddRole}
          >
            Add Role
          </Button>
        </ButtonToolbar>

        <BootstrapTable
          data={this.state.siteRoles}
          striped
          hover
          condensed
          options={{ noDataText: "No site roles!" }}
        >
          <TableHeaderColumn
            dataField="AccountSiteContactId"
            isKey={true}
            dataAlign="center"
            dataSort={true}
            hidden
          >
            ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField="AccountSiteId" hidden>
            AccountSiteId
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Name">Name</TableHeaderColumn>
          <TableHeaderColumn dataField="Address">Address</TableHeaderColumn>
          <TableHeaderColumn dataField="RoleTypeId" hidden>
            Role
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SiteRole">Role</TableHeaderColumn>
          <TableHeaderColumn
            dataField="viewLink"
            dataFormat={this.viewLinkFormatter.bind(this)}
          >
            Actions
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

export default SiteRoles
