import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"

import EmptyStateContainer from "../../containers/EmptyStateContainer"
import TeamAdd from "./TeamAdd"
import TeamList from "./TeamList"
import TeamDetail from "./TeamDetail"
import ToastHelper from "../../utils/ToastHelper"
import { peoplePrefixRequest, peopleSuffixRequest } from "../../actions/lookups"
import { teamRequest, addPeople } from "../../actions/team"
import * as api from "../../constants/api"

const propTypes = {
  auth: PropTypes.object,
  accountId: PropTypes.number,
  customerSites: PropTypes.array,
}

const defaultProps = {
  auth: {},
}

const getState = state => {
  return {
    team: state.team,
    ...state.userAccounts,
  }
}

const getActions = dispatch => {
  return {
    teamRequest: payload => dispatch(teamRequest(payload)),
    addPeople: payload => dispatch(addPeople(payload)),
    peoplePrefixRequest: () => dispatch(peoplePrefixRequest()),
    peopleSuffixRequest: () => dispatch(peopleSuffixRequest()),
  }
}

class TeamDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showAddTeam: false,
      selected: null,
      isSelf: false,
      disabled: false,
      customerSites: [],
      currentPage: 1,
      pageSize: 18,
      totalDataSize: 0,
    }

    this.onUpdateUser = this.onUpdateUser.bind(this)
  }

  get displayName() {
    return "TeamDashboard"
  }

  componentDidMount = () => {
    this.props.teamRequest({
      accountId: this.props.accountId,
    })
    this.props.peoplePrefixRequest()
    this.props.peopleSuffixRequest()
    this.getData()
  }

  componentWillReceiveProps = nextProps => {
    const currentToast = this.props.team.toastMessage
    const nextToast = nextProps.toastMessage
    if (nextToast !== undefined && nextToast !== null) {
      let shouldToast = false
      if (currentToast === null) {
        shouldToast = true
      } else {
        const d1 = new Date(currentToast.timestamp)
        const d2 = new Date(nextToast.timestamp)
        if (d1.getTime() !== d2.getTime()) {
          shouldToast = true
        }
      }

      if (shouldToast) {
        ToastHelper.toast(nextToast)
      }
    }
  }

  async getData() {
    const [siteList] = await Promise.all([this.getSiteData()])

    if (siteList.ok && siteList.body.IsSuccess) {
      this.setState({
        customerSites: siteList.body.AccountSites,
      })
    }
  }

  getSiteData() {
    const url = api.CUSTOMER_SITES

    return new Promise((resolve, reject) => {
      this.props.auth
        .request("post", url)
        .send({
          SearchParameters: {
            SiteName: "",
          },
          PageRequest: {
            PageSize: this.state.pageSize,
            PageNumber: this.state.currentPage,
          },
        })
        .then(
          response => {
            resolve(response)
          },
          failure => {
            reject(failure)
          },
        )
    })
  }

  // onRemoveUser(id) {
  //   // Set IsActive flag to false on user
  //   // Set the new state object
  //   const index = this.state.users.findIndex(x => x.UserAccountId === id)
  //   const users = Object.assign([], this.state.users)
  //   users[index].IsActive = false
  //   this.setState({ users })
  // }

  // onActivateUser(id) {
  //   // Set IsActive flag to false on user
  //   // Set the new state object
  //   const index = this.state.users.findIndex(x => x.UserAccountId === id)
  //   const users = Object.assign([], this.state.users)
  //   users[index].IsActive = true
  //   this.setState({ users })
  // }

  onUpdateUser(user) {
    // Set the new state object
    const index = this.state.users.findIndex(
      x => x.UserAccountId === user.UserAccountId,
    )
    const users = Object.assign([], this.state.users)
    users[index].Name = user.Name
    this.setState({ users })
  }

  toggleAddTeam = () => {
    this.setState({ showAddTeam: !this.state.showAddTeam })
  }

  handleOpenCloseAddTeam = () => {
    this.toggleAddTeam()
  }

  handleTeamSubmit = data => {
    data.accountId = this.props.accountId
    data.firstName = data.firstName ? data.firstName.trim() : null
    data.middleName = data.middleName ? data.middleName.trim() : null
    data.lastName = data.lastName ? data.lastName.trim() : null
    //console.log('team submit:', JSON.stringify(data))
    this.props.addPeople(data).then(() => this.setState({ showAddTeam: false }))
  }

  onSelectUser = selected => {
    let isSelf = false

    // allow user to edit own profile
    if (selected && selected.UserAccountId === this.props.userAccountId) {
      isSelf = true
    }

    let disabled = !this.props.auth.isAdmin() && !isSelf

    this.setState({
      selected,
      isSelf,
      disabled,
    })
  }

  render() {
    const isAdmin = this.props.auth.isAdmin()
    const className = "team-content"
    const msg = <div>No team members defined</div>
    let title = `No Team Members!`
    const { selected, isSelf, disabled } = this.state
    const { isLoading, items } = this.props.team

    /* 
            VENPORTAL-387 Do not display add team member if 
            user does not have admin role
        */
    const addButton = isAdmin && (
      <div className="row">
        <Button
          className="pull-left mt-xs"
          bsStyle="primary"
          onClick={this.handleOpenCloseAddTeam}
          disabled={isLoading}
        >
          Add Member
        </Button>
      </div>
    )

    return (
      <div className="team-dashboard">
        {this.state.showAddTeam && (
          <TeamAdd
            show={this.state.showAddTeam}
            auth={this.props.auth}
            readOnly={false}
            onCloseClick={this.handleOpenCloseAddTeam}
            onTeamSubmit={this.handleTeamSubmit}
            update={false}
          />
        )}

        {isLoading && (
          <div className="loadingMessage">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading team...
          </div>
        )}

        {isLoading === false && items.length === 0 && (
          <div className={className}>
            {addButton}
            <EmptyStateContainer
              alertStyle="info"
              title={title}
              message={msg}
            />
          </div>
        )}

        {isLoading === false && items.length > 0 && (
          <div className={className}>
            {addButton}
            <div className="col-md-6">
              <TeamList
                auth={this.props.auth}
                users={items}
                // onRemoveUser={(val) => { this.onRemoveUser(val) }}
                // onActivateUser={(val) => { this.onActivateUser(val) }}
                // updateRole={(id, isAdmin) => { this.updateRole(id, isAdmin) }}
                onUpdateUser={val => {
                  this.onUpdateUser(val)
                }}
                onSelectUser={this.onSelectUser}
                selected={selected}
                isSelf={isSelf}
                disabled={disabled}
              />
            </div>
            <div className="col-md-6">
              <TeamDetail
                {...this.props}
                selectedUser={this.state.selected}
                customerSites={this.state.customerSites}
                isAdmin={isAdmin}
                isSelf={isSelf}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
}

TeamDashboard.propTypes = propTypes
TeamDashboard.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(TeamDashboard)
