import React from "react"
import { connect } from "react-redux"
import Alert from "react-bootstrap/lib/Alert"
import Button from "react-bootstrap/lib/Button"
import { Icon } from "react-fa"
import PropTypes from "prop-types"
import EmailAdd from "./EmailAdd"
import EmptyStateContainer from "../../containers/EmptyStateContainer"

const propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  pendingChanges: PropTypes.object.isRequired,
  onPendingChange: PropTypes.func.isRequired,
}

const getState = state => {
  return {
    ...state.lookups,
  }
}

class EmailContacts extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      emailAddresses: [],
      isLoading: false,
      alert: null,
      showAddEmail: false,
      row: null,
      isAdding: false,
    }

    this.handleEmailSubmit = this.handleEmailSubmit.bind(this)
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
      nextProps.profile.EmailAddresses !== undefined
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
    const email = this.state.emailAddresses[index]
    this.props.onPendingChange(email, index)
  }

  handleEmailSubmit(data) {
    const emailType = this.props.emailTypes.filter(
      i => i.ItemId === parseInt(data.emailTypeId, 10),
    )

    const email = {
      Type: data.emailTypeId,
      Email: data.email,
      TypeName: emailType[0].Value,
    }

    this.props.onPendingChange(email)
    this.setState({ isAdding: false })
  }

  updateFromProps(props) {
    let isAdding = this.state.isAdding
    if (props.isEditing === false) {
      isAdding = false
    }

    this.setState({
      emailAddresses: props.profile.EmailAddresses,
      isAdding,
    })
  }

  render() {
    const props = {
      auth: this.props.auth,
      onEmailSubmit: this.handleEmailSubmit,
    }

    const emailRows = this.state.emailAddresses.map((item, index) => {
      return (
        <div className="profile-list__row" key={`email-${item.EmailAddressId}`}>
          <div className="profile-list__icon">{<Icon name="envelope" />}</div>
          <div className="profile-list__content">
            {item.Email}
            <span className="meta">{item.TypeName}</span>
          </div>
          <div className="profile-list__actions">
            {this.props.isEditing && (
              <Button
                bsStyle="danger"
                bsSize="xsmall"
                onClick={() => this.onRemoveClick(index)}
              >
                <Icon name="trash" />
              </Button>
            )}
          </div>
          {/* Show add button on last email entry */
          this.props.isEditing &&
            index === this.state.emailAddresses.length - 1 && (
              <Button
                bsStyle="primary"
                bsSize="xsmall"
                onClick={this.onAddClick}
              >
                <Icon name="plus" />
              </Button>
            )}
        </div>
      )
    })

    const pendingEmails = this.props.pendingChanges.emails.map(
      (item, index) => {
        const action = item.EmailAddressId !== undefined ? "remove" : "add"
        const pendingItem = item
        pendingItem.action = action
        pendingItem.key = `pending-email-${index}`
        return pendingItem
      },
    )

    return (
      <div className="email-contacts">
        {this.state.isLoading && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" /> Loading emails...
          </Alert>
        )}

        <div className="profile-list">
          {this.state.emailAddresses.length > 0 && emailRows}
          {this.state.emailAddresses.length === 0 &&
            this.props.isEditing === false && (
              <EmptyStateContainer
                alertStyle="info"
                title="No email addresses assigned!"
              />
            )}
          {this.props.isEditing &&
            (this.state.isAdding || this.state.emailAddresses.length === 0) && (
              <EmailAdd
                {...props}
                onCancelClick={this.onAddCancelClick}
                showCancelButton={this.state.emailAddresses.length > 0}
              />
            )}
        </div>

        <div>
          {this.props.isEditing &&
            pendingEmails.length > 0 &&
            pendingEmails.map(item => {
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
                      {item.Email}
                      <span className="meta">{item.TypeName}</span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }
}

EmailContacts.propTypes = propTypes

export default connect(getState)(EmailContacts)
