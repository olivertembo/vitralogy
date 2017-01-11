import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Alert from "react-bootstrap/lib/Alert"
import Button from "react-bootstrap/lib/Button"
import { Icon } from "react-fa"
import AccountRoleAdd from "./AccountRoleAdd"
import EmptyStateContainer from "../../containers/EmptyStateContainer"

const propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  pendingChanges: PropTypes.object.isRequired,
  onPendingChange: PropTypes.func.isRequired,
}

const defaultProps = {
  auth: {},
  profile: {},
}

const getState = state => {
  return {
    ...state.lookups,
  }
}

class AccountRoles extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      accountRoles: [],
      isLoading: false,
      alert: null,
      showAddRole: false,
      row: null,
      isAdding: false,
    }

    this.handleRoleSubmit = this.handleRoleSubmit.bind(this)
    this.onAddClick = this.onAddClick.bind(this)
    this.onRemoveClick = this.onRemoveClick.bind(this)
    this.onAddCancelClick = this.onAddCancelClick.bind(this)
  }

  componentDidMount() {
    this.updateFromProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.profile !== undefined &&
      nextProps.profile.AccountRoles !== undefined
    ) {
      this.updateFromProps(nextProps)
    }
  }

  onAddClick() {
    this.setState({ isAdding: true })
  }

  onAddCancelClick() {
    this.setState({ isAdding: false })
  }

  onRemoveClick(index) {
    const role = this.state.accountRoles[index]
    this.props.onPendingChange(role, index)
  }

  handleRoleSubmit(data) {
    const roleType = this.props.accountRoles.filter(
      i => i.ItemId === parseInt(data.roleTypeId, 10),
    )

    const accountRole = {
      AccountContactId: data.roleTypeId,
      AccountRole: roleType[0].Value,
    }

    this.props.onPendingChange(accountRole)
    this.setState({ isAdding: false })
  }

  updateFromProps(props) {
    let isAdding = this.state.isAdding
    if (props.isEditing === false) {
      isAdding = false
    }

    this.setState({
      accountRoles: props.profile.AccountRoles,
      isAdding,
    })
  }

  render() {
    const props = {
      auth: this.props.auth,
      onRoleSubmit: this.handleRoleSubmit,
    }

    const roleRows = this.state.accountRoles.map((item, index) => {
      return (
        <div
          className="profile-list__row"
          key={`role-${item.AccountContactId}`}
        >
          <div className="profile-list__icon">
            {<Icon name="address-card-o" />}
          </div>
          <div className="profile-list__content">{item.AccountRole}</div>
          <div className="profile-list__actions">
            {this.props.isEditing && (
              <Button
                bsStyle="danger"
                bsSize="xsmall"
                text="remove"
                onClick={() => this.onRemoveClick(index)}
              >
                <Icon name="trash" />
              </Button>
            )}
          </div>
          {/* Show add button on last role entry */
          this.props.isEditing && index === this.state.accountRoles.length - 1 && (
            <Button
              bsStyle="primary"
              bsSize="xsmall"
              text="add"
              onClick={this.onAddClick}
            >
              <Icon name="plus" />
            </Button>
          )}
        </div>
      )
    })

    const pendingRoles = this.props.pendingChanges.roles.map((item, index) => {
      const action = item.RoleTypeId !== undefined ? "remove" : "add"
      const pendingItem = item
      pendingItem.action = action
      pendingItem.key = `pending-role-${index}`
      return pendingItem
    })

    return (
      <section className="account-roles clearfix">
        {this.state.isLoading && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" /> Loading account roles...
          </Alert>
        )}

        <div className="profile-list profile-list--no-icon">
          {this.state.accountRoles.length > 0 && roleRows}
          {this.state.accountRoles.length === 0 &&
            this.props.isEditing === false && (
              <EmptyStateContainer
                alertStyle="info"
                title="No account roles assigned!"
              />
            )}

          {this.props.isEditing &&
            (this.state.isAdding || this.state.accountRoles.length === 0) && (
              <AccountRoleAdd
                {...props}
                onCancelClick={this.onAddCancelClick}
                showCancelButton={this.state.accountRoles.length > 0}
              />
            )}

          {this.props.isEditing &&
            pendingRoles.length > 0 &&
            pendingRoles.map(item => {
              return (
                <div key={item.key}>
                  <div
                    className={`profile-list__row ${
                      item.action === "add" ? "text-success" : "text-danger"
                    }`}
                  >
                    <div className="profile-list__icon">
                      {item.action === "add" ? (
                        <Icon name="plus" />
                      ) : (
                        <Icon name="minus" />
                      )}
                    </div>
                    <div className="profile-list__content">
                      {item.AccountRole}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </section>
    )
  }
}

AccountRoles.propTypes = propTypes
AccountRoles.defaultProps = defaultProps

export default connect(getState)(AccountRoles)
