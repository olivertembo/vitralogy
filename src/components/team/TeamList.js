import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Label from "react-bootstrap/lib/Label"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"

import TeamAdd from "./TeamAdd"
import {
  phoneTypesRequest,
  emailTypesRequest,
  userAccountRoleTypesRequest,
  accountRolesRequest,
} from "../../actions/lookups"
import { updatePeople } from "../../actions/team"

const propTypes = {
  auth: PropTypes.object,
  onSelectUser: PropTypes.func.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
}

const defaultProps = {
  auth: {},
  user: [],
  selected: {},
}

const getState = state => {
  return {
    ...state.lookups,
    ...state.userAccounts,
  }
}

const getActions = dispatch => {
  return {
    phoneTypesRequest: () => dispatch(phoneTypesRequest()),
    emailTypesRequest: () => dispatch(emailTypesRequest()),
    userAccountRoleTypesRequest: () => dispatch(userAccountRoleTypesRequest()),
    accountRolesRequest: () => dispatch(accountRolesRequest()),
    updatePeople: payload => dispatch(updatePeople(payload)),
  }
}

class TeamList extends React.Component {
  constructor() {
    super()

    this.state = {
      showPopup: false,
      popupReadOnly: true,
      isSelf: false,
    }

    this.flagFormatter = this.flagFormatter.bind(this)
    this.roleFormatter = this.roleFormatter.bind(this)
    this.nameFormatter = this.nameFormatter.bind(this)
  }

  componentDidMount() {
    if (this.props.emailTypes.length === 0) {
      this.props.emailTypesRequest()
    }

    if (this.props.phoneTypes.length === 0) {
      this.props.phoneTypesRequest()
    }

    if (this.props.userAccountRoleTypes.length === 0) {
      this.props.userAccountRoleTypesRequest()
    }

    if (this.props.accountRoles.length === 0) {
      this.props.accountRolesRequest()
    }
  }

  showPopup(selectedUserId, readOnly) {
    let popupReadOnly = readOnly
    let isSelf = false

    // allow user to edit own profile
    if (selectedUserId === this.props.userAccountId) {
      popupReadOnly = false
      isSelf = true
    }

    this.setState({
      showPopup: true,
      popupReadOnly,
      isSelf,
    })
  }

  toggleAddTeam = () => {
    this.setState({ showPopup: !this.state.showPopup })
  }

  handleOpenCloseAddTeam = () => {
    this.toggleAddTeam()
  }

  handleTeamSubmit = data => {
    data.userAccountId = this.props.selected.UserAccountId
    data.email = this.props.selected.Email
    data.isActive = this.props.selected.IsActive
    data.isRegistered = this.props.selected.IsRegistered
    data.isAdmin = this.props.selected.IsAdmin
    data.setupPhone = this.props.selected.SetupPhone
    data.setupEmail = this.props.selected.SetupEmail
    data.userPicture = this.props.selected.UserPicture
    data.roleTypeId = this.props.selected.RoleTypeId
    data.firstName = data.firstName ? data.firstName.trim() : null
    data.middleName = data.middleName ? data.middleName.trim() : null
    data.lastName = data.lastName ? data.lastName.trim() : null
    console.log("team update:", JSON.stringify(data))
    this.props.updatePeople(data).then(() =>
      this.setState({
        showPopup: false,
        popupReadOnly: true,
        isSelf: false,
      }),
    )
  }

  roleFormatter(cell, row) {
    if (row.IsAdmin) return "Admin"

    return "Worker"
  }

  flagFormatter(cell, row, enumObject) {
    var style = cell ? "success" : "danger"

    return <Label bsStyle={style}>{enumObject[cell]}</Label>
  }

  nameFormatter(cell, row) {
    const profileToolTip = (
      <Tooltip id="profileToolTip">{`Click to update ${cell}'s profile`}</Tooltip>
    )
    const isAdmin = this.props.auth.isAdmin()

    return (
      <span>
        <OverlayTrigger overlay={profileToolTip} placement="top">
          <Button
            bsStyle="link"
            bsSize="xsmall"
            bsClass="btn-inline"
            onClick={() => this.showPopup(row.UserAccountId, !isAdmin)}
          >
            <Icon name="pencil" />
          </Button>
        </OverlayTrigger>
        {` ${cell}`}
      </span>
    )
  }

  onRowSelect = (row, isSelected, event, rowIndex) => {
    this.props.onSelectUser(row)
  }

  render() {
    const status = {
      true: "Yes",
      false: "No",
    }

    const options = {
      hideSizePerPage: true,
      noDataText: "No team members added",
    }

    return (
      <div className="team-list">
        {this.state.showPopup && (
          <TeamAdd
            show={this.state.showPopup}
            auth={this.props.auth}
            readOnly={this.state.popupReadOnly}
            isSelf={this.state.isSelf}
            onCloseClick={this.handleOpenCloseAddTeam}
            onTeamSubmit={this.handleTeamSubmit}
            selected={this.props.selected}
            update={true}
          />
        )}

        <BootstrapTable
          data={this.props.users}
          striped
          hover
          condensed
          options={options}
          selectRow={{
            mode: "radio",
            bgColor: "#448AFF",
            hideSelectColumn: true,
            clickToSelect: true,
            onSelect: this.onRowSelect,
          }}
          trClassName="break-word"
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
          <TableHeaderColumn
            dataField="Name"
            dataFormat={this.nameFormatter}
            dataSort={true}
          >
            Name
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="IsActive"
            dataFormat={this.flagFormatter}
            formatExtraData={status}
            dataSort={true}
            dataAlign="center"
          >
            Active
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="IsRegistered"
            dataFormat={this.flagFormatter}
            formatExtraData={status}
            dataSort={true}
            dataAlign="center"
          >
            Registered
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="IsAdmin"
            width="10%"
            dataSort={true}
            dataAlign="center"
            dataFormat={this.roleFormatter}
          >
            Role
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

TeamList.propTypes = propTypes
TeamList.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(TeamList)
