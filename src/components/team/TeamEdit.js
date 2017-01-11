import React from "react"
import PropTypes from "prop-types"
import Modal from "react-bootstrap/lib/Modal"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import SweetAlert from "react-bootstrap-sweetalert"
import MemberProfile from "./MemberProfile"
import ProfileContacts from "./ProfileContacts"
import * as api from "../../constants/api"
// import ProfileRoles from './ProfileRoles'

const propTypes = {
  auth: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  userId: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
}

export default class TeamEdit extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isEditing: false,
      isSaving: false,
      isLoading: false,
      profile: {
        FirstName: "",
        LastName: "",
        MiddleName: "",
        EmailAddresses: [],
        PhoneNumbers: [],
        AccountRoles: [],
        Fax: "",
        Mobile: "",
      },
      originalProfile: {},
      pendingChanges: {
        emails: [],
        phones: [],
        roles: [],
        userAccountRole: null,
        count: 0,
      },
      alert: null,
    }

    this.onEditClick = this.onEditClick.bind(this)
    this.onSaveClick = this.onSaveClick.bind(this)
    this.onPendingChange = this.onPendingChange.bind(this)
    this.onCloseClick = this.onCloseClick.bind(this)
    this.saveChanges = this.saveChanges.bind(this)
    this.cancelChanges = this.cancelChanges.bind(this)
    this.onCancelClick = this.onCancelClick.bind(this)
    this.onSelectRole = this.onSelectRole.bind(this)
  }

  componentDidMount() {
    this.getUserInfo()
  }

  onEditClick() {
    this.setState({
      isEditing: true,
      originalProfile: this.state.profile,
    })
  }

  onSaveClick() {
    this.setState({ isSaving: true })
    this.saveChanges()
  }

  onSelectRole(role) {
    // User account role (admin/worker)
    const pendingChanges = {
      ...this.state.pendingChanges,
      userAccountRole: role.value,
      count: this.state.pendingChanges.count + 1,
    }

    this.setState({ pendingChanges })
  }

  onCancelClick() {
    this.cancelChanges(false)
  }

  onPendingChange(item, index) {
    if (item.hasOwnProperty("Email")) {
      let pendingEmailAddresses = this.state.pendingChanges.emails
      pendingEmailAddresses = pendingEmailAddresses.concat(item)

      if (item.EmailAddressId !== undefined) {
        const newEmailAddresses = this.state.profile.EmailAddresses.slice(
          0,
          index,
        ).concat(this.state.profile.EmailAddresses.slice(index + 1))

        const profile = {
          ...this.state.profile,
          EmailAddresses: newEmailAddresses,
        }

        this.setState({ profile })
      }

      const pendingChanges = {
        ...this.state.pendingChanges,
        emails: pendingEmailAddresses,
        count: this.state.pendingChanges.count + 1,
      }

      this.setState({ pendingChanges })
    } else if (item.hasOwnProperty("AccountContactId")) {
      // Account Role change
      let pendingAccountRoles = this.state.pendingChanges.roles
      pendingAccountRoles = pendingAccountRoles.concat(item)

      if (item.AccountContactId !== undefined) {
        const newAccountRoles = this.state.profile.AccountRoles.slice(
          0,
          index,
        ).concat(this.state.profile.AccountRoles.slice(index + 1))

        const profile = {
          ...this.state.profile,
          AccountRoles: newAccountRoles,
        }

        this.setState({ profile })
      }

      const pendingChanges = {
        ...this.state.pendingChanges,
        roles: pendingAccountRoles,
        count: this.state.pendingChanges.count + 1,
      }

      this.setState({ pendingChanges })
    } else if (item.hasOwnProperty("FullNumber")) {
      // Phone
      let pendingPhoneNumbers = this.state.pendingChanges.phones
      pendingPhoneNumbers = pendingPhoneNumbers.concat(item)

      if (item.PeoplePhoneNumberId !== undefined) {
        const newPhoneNumbers = this.state.profile.PhoneNumbers.slice(
          0,
          index,
        ).concat(this.state.profile.PhoneNumbers.slice(index + 1))

        const profile = {
          ...this.state.profile,
          PhoneNumbers: newPhoneNumbers,
        }

        this.setState({ profile })
      }

      const pendingChanges = {
        ...this.state.pendingChanges,
        phones: pendingPhoneNumbers,
        count: this.state.pendingChanges.count + 1,
      }

      this.setState({ pendingChanges })
    }
  }

  onCloseClick() {
    const { emails, phones, roles, userAccountRole } = this.state.pendingChanges
    if (
      emails.length === 0 &&
      phones.length === 0 &&
      roles.length === 0 &&
      userAccountRole === null
    ) {
      this.props.onHide(this.props.userId, this.state.profile.IsAdmin)
    }

    // Confirm pending changes
    this.showAlert()
  }

  saveChanges() {
    this.state.pendingChanges.emails.forEach(item => {
      if (item.PeopleEmailAddrId === undefined) {
        // Add
        this.addEmail(item)
      } else {
        // Remove
        this.removeEmail(item)
      }
    })

    this.state.pendingChanges.phones.forEach(item => {
      if (item.PeoplePhoneNumberId === undefined) {
        // Add
        this.addPhone(item)
      } else {
        // Remove
        this.removePhone(item)
      }
    })

    this.state.pendingChanges.roles.forEach(item => {
      if (item.action === "add") {
        this.addAccountRole(item)
      } else {
        this.removeAccountRole(item)
      }
    })

    if (this.state.pendingChanges.userAccountRole !== null) {
      this.updateUserAccountRole()
    }
  }

  removePhone(item) {
    this.props.auth
      .request("post", api.PHONE_REMOVE)
      .query({ userAccountId: this.props.userId })
      .query({ peoplePhoneNumberId: item.PeoplePhoneNumberId })
      .query({ phoneNumberId: item.PhoneNumberId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  removeEmail(item) {
    this.props.auth
      .request("post", api.EMAIL_REMOVE)
      .query({ userAccountId: this.props.userId })
      .query({ peopleEmailAddrId: item.PeopleEmailAddrId })
      .query({ emailAddressId: item.EmailAddressId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  removeAccountRole(item) {
    this.props.auth
      .request("post", api.ACCOUNT_ROLE_REMOVE)
      .query({ userAccountId: this.props.userId })
      .query({ accountContactId: item.AccountContactId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  addPhone(item) {
    this.props.auth
      .request("post", api.PHONE_NEW)
      .query({ userAccountId: this.props.userId })
      .query({ phoneNumberTypeId: item.Type })
      .query({ phone: item.FullNumber })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  addEmail(item) {
    this.props.auth
      .request("post", api.EMAIL_NEW)
      .query({ userAccountId: this.props.userId })
      .query({ emailAddressTypeId: item.Type })
      .query({ peopleEmailAddrId: 0 })
      .query({ email: item.Email })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  addAccountRole(item) {
    this.props.auth
      .request("post", api.ACCOUNT_ROLE_NEW)
      .query({ userAccountId: this.props.userId })
      .query({ contactRoleId: item.AccountContactId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  cancelChanges(dismiss) {
    this.setState({
      profile: this.state.originalProfile,
      pendingChanges: {
        emails: [],
        phones: [],
        roles: [],
        userAccountRole: null,
        count: 0,
      },
      isEditing: false,
      alert: null,
    })

    if (dismiss) {
      this.props.onHide()
    }
  }

  updateUserAccountRole() {
    this.props.auth
      .request("post", api.TEAM_ROLE_UPDATE)
      .query({ userAccountId: this.props.userId })
      .query({ roleId: this.state.pendingChanges.userAccountRole })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {},
      )
      .then(() => {
        const pendingChanges = {
          ...this.state.pendingChanges,
          count: this.state.pendingChanges.count - 1,
        }

        //console.log('Setting pending changes : ' + JSON.stringify(pendingChanges))
        this.setState({ pendingChanges }, () => this.getUserInfo())
      })
  }

  getUserInfo() {
    if (this.state.pendingChanges.count <= 0) {
      this.setState({ isLoading: true })

      this.props.auth
        .request("get", api.TEAM_INFO)
        .query({ userAccountId: this.props.userId })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            if (response.body.IsSuccess === true) {
              this.setState({
                profile: response.body,
                isEditing: false,
                isSaving: false,
                pendingChanges: {
                  emails: [],
                  phones: [],
                  roles: [],
                  userAccountRole: null,
                  count: 0,
                },
              })
            } else {
              console.log("failure to get team info")
            }
          },
          () => {
            console.log("failure to get team info")
          },
        )
        .then(() => {
          this.setState({ isLoading: false })
        })
    } else {
      console.log(
        "Changes pending: ",
        this.state.pendingChanges.count,
        " skip team retrieval",
      )
    }
  }

  showAlert() {
    const getAlert = () => (
      <SweetAlert
        title="Pending Changes"
        custom
        customIcon={require("../../assets/images/question.png")}
        showCancel
        confirmBtnText="Save"
        confirmBtnBsStyle="primary"
        cancelBtnText="Discard"
        cancelBtnBsStyle="default"
        onConfirm={() => this.saveChanges()}
        onCancel={() => this.cancelChanges(true)}
      >
        You have unsaved changes. Are you sure you want to close?
      </SweetAlert>
    )

    this.setState({ alert: getAlert() })
  }

  render() {
    const { profile, isEditing, isSaving, pendingChanges } = this.state
    const { auth, readOnly, isSelf } = this.props

    const props = {
      auth,
      readOnly,
      profile,
      isEditing,
      isSaving,
      pendingChanges,
    }

    return (
      <Modal
        backdrop="static"
        show={this.props.show}
        onHide={this.onCloseClick}
      >
        <Modal.Header closeButton>
          {this.state.isLoading === false && (
            <MemberProfile
              {...props}
              onEditClick={this.onEditClick}
              onSaveClick={this.onSaveClick}
              onCancelClick={this.onCancelClick}
              onSelectRole={this.onSelectRole}
              isAdmin={this.props.isAdmin}
              isSelf={isSelf}
            />
          )}
          {this.state.isLoading && (
            <Alert bsStyle="info">
              <Icon spin name="spinner" /> Loading user profile...
            </Alert>
          )}
        </Modal.Header>
        <Modal.Body>
          {this.state.alert}
          {this.state.isLoading === false && (
            <div>
              <ProfileContacts
                {...props}
                onPendingChange={this.onPendingChange}
              />
              {/*
                                <ProfileRoles
                                    {...props}
                                    onPendingChange={this.onPendingChange}
                                />
                */}
            </div>
          )}
        </Modal.Body>
      </Modal>
    )
  }
}

TeamEdit.propTypes = propTypes
TeamEdit.defaultProps = defaultProps
