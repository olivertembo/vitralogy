import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Tabs from "react-bootstrap/lib/Tabs"
import Tab from "react-bootstrap/lib/Tab"
import Icon from "react-fa/lib/Icon"

import ContactList from "./ContactList"
import SiteAssignments from "./SiteAssignments"
import AddContactForm from "./AddContactForm"
import AuthenticationInfo from "./AuthenticationInfo"
import * as api from "../../constants/api"
import OverlayButton from "../layout/OverlayButton"
import ToastHelper from "../../utils/ToastHelper"
import {
  postNewContactItem,
  postRemoveContactItem,
  postAddSiteAssignment,
  postRemoveSiteAssignment,
} from "../../actions/team"

const getState = state => {
  return {
    emailTypes: [...state.lookups.emailTypes],
    phoneTypes: [...state.lookups.phoneTypes],
    isPosting: state.team.isPosting,
    salutations: [...state.lookups.salutations],
    suffixes: [...state.lookups.suffixes],
  }
}

const getActions = dispatch => {
  return {
    postNewContactItem: payload => dispatch(postNewContactItem(payload)),
    postRemoveContactItem: payload => dispatch(postRemoveContactItem(payload)),
    postAddSiteAssignment: payload => dispatch(postAddSiteAssignment(payload)),
    postRemoveSiteAssignment: payload =>
      dispatch(postRemoveSiteAssignment(payload)),
  }
}

const propTypes = {
  selectedUser: PropTypes.object,
  emailTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  phoneTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  customerSites: PropTypes.array,
  postNewContactItem: PropTypes.func.isRequired,
  postRemoveContactItem: PropTypes.func.isRequired,
  postAddSiteAssignment: PropTypes.func.isRequired,
  isPosting: PropTypes.bool.isRequired,
  isSelf: PropTypes.bool.isRequired,
}

const defaultProps = {
  selectedUser: null,
}

class TeamDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      contactDetails: null,
      siteAssignments: null,
      isLoading: false,
      hasError: false,
      showAddContact: false,
      showAddSiteAssignment: false,
      selectedSites: [],
      searchKeyword: null,
    }
  }

  get displayName() {
    return "TeamDetail"
  }

  componentWillReceiveProps = nextProps => {
    const p = this.props.selectedUser
    const np = nextProps.selectedUser

    if (np !== null) {
      if (p === null || p.UserAccountId !== np.UserAccountId) {
        this.getDetails(np.UserAccountId)
        this.getSiteAssignments(np.UserAccountId, null)
      }
    }
  }

  onSubmitContact = data => {
    this.props
      .postNewContactItem({
        ...data,
        userAccountId: this.props.selectedUser.UserAccountId,
      })
      .then(response => {
        this.updateContactDetails({ ...data, ...response })
      })
      .then(() => this.toggleshowAddContact())
  }

  onRemoveContactItem = data => {
    this.props
      .postRemoveContactItem({
        ...data,
        userAccountId: this.props.selectedUser.UserAccountId,
      })
      .then(() => {
        this.removeFromContactDetails(data)
      })
  }

  onSubmitSiteAssignment = data => {
    this.props
      .postAddSiteAssignment({
        ...data,
        userAccountId: this.props.selectedUser.UserAccountId,
      })
      //.then(() => this.updateSiteDetails(data))
      //.then(() => this.toggleShowAddSiteAssignment())
      .then(() =>
        this.getSiteAssignments(this.props.selectedUser.UserAccountId, null),
      ) //todo optimize
  }

  onRemoveSiteAssignment = data => {
    const siteAssignments = Object.assign([], this.state.siteAssignments)
    const siteIndex = siteAssignments.findIndex(
      x => x.CustomerSiteId === data.AccountSiteId,
    )

    this.props
      .postRemoveSiteAssignment({
        restrictionId: siteAssignments[siteIndex].UserAccountSiteRestrictionId,
      })
      .then(() => this.removeFromSiteAssignments(data))
  }

  getSiteAssignments = (userAccountId, searchKeyword) => {
    let url = api.USER_SITE_RESTRICTIONS
    console.log(`Retrieving site assignements : ${url}`)

    this.setState({
      siteAssignments: null,
      selectedSites: [],
      isLoading: true,
    })

    let hasError = false
    let siteAssignments = null
    let selectedSites = []
    this.props.auth
      .request("get", url)
      .query({ userAccountId })
      .query({ searchKeyword })
      .then(response => {
        if (response.body.IsSuccess) {
          siteAssignments = response.body.Items
          if (siteAssignments.length > 0) {
            for (const site of siteAssignments) {
              selectedSites.push(site.CustomerSiteId)
            }
          }
        } else {
          hasError = true
        }
      })
      .catch(() => {
        hasError = true
      })
      .then(() => {
        if (hasError) {
          ToastHelper.error(`Error retrieving site assignments`)
        }
        this.setState({
          isLoading: false,
          siteAssignments,
          selectedSites,
          searchKeyword,
        })
      })
  }

  getDetails = userAccountId => {
    this.setState({
      contactDetails: null,
      isLoading: true,
    })

    let hasError = false
    let contactDetails = null
    this.props.auth
      .request("get", api.TEAM_INFO)
      .query({ userAccountId })
      .then(response => {
        if (response.body.IsSuccess === true) {
          contactDetails = response.body
        } else {
          hasError = true
        }
      })
      .catch(() => {
        hasError = true
      })
      .then(() => {
        if (hasError) {
          ToastHelper.error("Error retrieving profile info")
        }
        this.setState({
          isLoading: false,
          contactDetails,
        })
      })
  }

  removeFromContactDetails = data => {
    if (data.EmailAddressId !== undefined) {
      // Remove email
      const emailAddresses = this.state.contactDetails.EmailAddresses
      const index = emailAddresses.findIndex(
        x => x.EmailAddressId === data.EmailAddressId,
      )
      const newEmailAddresses = emailAddresses
        .slice(0, index)
        .concat(emailAddresses.slice(index + 1))

      const contactDetails = {
        ...this.state.contactDetails,
        EmailAddresses: newEmailAddresses,
      }

      this.setState({ contactDetails })
    } else {
      // Remove phone
      const phoneNumbers = this.state.contactDetails.PhoneNumbers
      const index = phoneNumbers.findIndex(
        x => x.PhoneNumberId === data.PhoneNumberId,
      )
      const newPhoneNumbers = phoneNumbers
        .slice(0, index)
        .concat(phoneNumbers.slice(index + 1))

      const contactDetails = {
        ...this.state.contactDetails,
        PhoneNumbers: newPhoneNumbers,
      }

      this.setState({ contactDetails })
    }
  }

  updateContactDetails = data => {
    const contactDetails = Object.assign({}, this.state.contactDetails)
    const ItemId = Number(data.contactTypeId)

    if (data.contactOption === "0") {
      // Email
      const { EmailAddressId, PeopleEmailAddrId } = data
      const TypeName = this.props.emailTypes.find(i => i.ItemId === ItemId)
        .Value

      const EmailAddresses = Object.assign(
        [],
        this.state.contactDetails.EmailAddresses,
      )

      EmailAddresses.push({
        Email: data.contactInput,
        EmailAddressId,
        PeopleEmailAddrId,
        Type: data.contactType,
        TypeName,
      })

      contactDetails.EmailAddresses = EmailAddresses
    } else {
      // Phone
      const { PhoneNumberId, PeoplePhoneNumberId } = data
      const TypeName = this.props.phoneTypes.find(i => i.ItemId === ItemId)
        .Value

      const PhoneNumbers = Object.assign(
        [],
        this.state.contactDetails.PhoneNumbers,
      )

      PhoneNumbers.push({
        FullNumber: data.contactInput,
        PhoneNumberId,
        PeoplePhoneNumberId,
        Type: data.contactType,
        TypeName,
      })

      contactDetails.PhoneNumbers = PhoneNumbers
    }

    this.setState({ contactDetails })
  }

  updateSiteDetails = data => {
    const siteAssignments = Object.assign([], this.state.siteAssignments)
    const CustomerId = Number(data.customerId)

    const customerIndex = siteAssignments.findIndex(
      x => x.CustomerId === CustomerId,
    )

    let Sites = null
    if (customerIndex > -1) {
      Sites = Object.assign([], siteAssignments[customerIndex].Sites)
    } else {
      Sites = []
    }

    data.customerSiteId.map(id => {
      const CustomerSiteId = Number(id)
      const originalCustomerIndex = this.props.customerSiteOptions.findIndex(
        x => x.CustomerId === CustomerId,
      )

      const siteIndex = this.props.customerSiteOptions[
        originalCustomerIndex
      ].Sites.findIndex(z => z.CustomerSiteId === CustomerSiteId)

      const siteItem = this.props.customerSiteOptions[originalCustomerIndex]
        .Sites[siteIndex]

      return Sites.push(siteItem)
    })

    if (customerIndex > -1) {
      siteAssignments[customerIndex].Sites = Sites
    } else {
      const originalCustomerIndex = this.props.customerSiteOptions.findIndex(
        x => x.CustomerId === CustomerId,
      )

      const CustomerName = this.props.customerSiteOptions[originalCustomerIndex]
        .CustomerName

      siteAssignments.push({
        Count: Sites.length,
        CustomerId,
        CustomerName,
        Sites,
      })
    }

    this.setState({ siteAssignments })
  }

  removeFromSiteAssignments = data => {
    const selectedSites = Object.assign([], this.state.selectedSites)
    const index = selectedSites.indexOf(data.AccountSiteId)
    selectedSites.splice(index, 1)

    this.setState({ selectedSites })
  }

  toggleshowAddContact = () => {
    this.setState({ showAddContact: !this.state.showAddContact })
  }

  toggleShowAddSiteAssignment = () => {
    this.setState({ showAddSiteAssignment: !this.state.showAddSiteAssignment })
  }

  onFilterSiteAssignmentsChange = searchTerm => {
    this.getSiteAssignments(this.props.selectedUser.UserAccountId, searchTerm)
  }

  onSiteAssignmentSearchChange = searchKeyword => {
    this.setState({ searchKeyword })
  }

  getSalutation = () => {
    let salutation = ""
    if (this.props.selectedUser.SalutationId) {
      const lookUp = this.props.salutations.filter(
        x => x.ItemId === Number(this.props.selectedUser.SalutationId),
      )

      if (lookUp.length) {
        salutation = `${lookUp[0].Value} `
      }
    }

    return salutation
  }

  getSuffix = () => {
    let suffix = ""
    if (this.props.selectedUser.SuffixId) {
      const lookUp = this.props.suffixes.filter(
        x => x.ItemId === Number(this.props.selectedUser.SuffixId),
      )

      if (lookUp.length) {
        suffix = ` ${lookUp[0].Value}`
      }
    }

    return suffix
  }

  render() {
    if (this.props.selectedUser === null) {
      return (
        <div className="team-detail empty">
          <div className="message">
            <Icon name="users" />
            <h1 className="mb-sm">Select a User</h1>
            <p>Pick a user on the left to see more detail.</p>
          </div>
        </div>
      )
    }

    const { SetupEmail } = this.props.selectedUser
    let authenticationTabTitle = "Authentication"
    if (SetupEmail === null) {
      authenticationTabTitle = (
        <div>
          Authentication <Icon name="exclamation-circle" />
        </div>
      )
    }

    return (
      <div className="team-detail">
        {this.state.showAddContact && (
          <AddContactForm
            show={this.state.showAddContact}
            onHide={this.toggleshowAddContact}
            isPosting={this.props.isPosting}
            emailTypes={this.props.emailTypes}
            phoneTypes={this.props.phoneTypes}
            onSubmit={this.onSubmitContact}
          />
        )}
        <div className="row">
          <div className="col-sm-4">
            <h3>
              {this.getSalutation()}
              {this.props.selectedUser.Name}
              {this.getSuffix()}
            </h3>
            <Icon name="user-circle" size="5x" />
          </div>
          <div className="col-sm-8">
            <h4>
              Contact Info{" "}
              <OverlayButton
                bsSize="xs"
                onClick={this.toggleshowAddContact}
                disabled={this.props.disabled}
                text={
                  this.props.disabled ? (
                    <div>Insufficient permission for this action.</div>
                  ) : (
                    <div>Click to add new email or phone contact.</div>
                  )
                }
              >
                +
              </OverlayButton>
            </h4>
            <ContactList
              isAdmin={this.props.isAdmin}
              details={this.state.contactDetails}
              onRemoveItem={this.onRemoveContactItem}
              disabled={this.props.disabled}
              isSelf={this.props.isSelf}
            />
          </div>
        </div>
        <div className="row">
          <Tabs defaultActiveKey={1} id="user-tabs">
            {
              <Tab eventKey={1} title="Site Assignments">
                {this.state.isLoading && (
                  <div className="site-assignments">
                    <Icon spin size="2x" name="spinner" /> Loading...
                  </div>
                )}

                {!this.state.isLoading && (
                  <SiteAssignments
                    isAdmin={this.props.isAdmin}
                    selectedSites={this.state.selectedSites}
                    customerSites={this.props.customerSites}
                    onSubmitItem={this.onSubmitSiteAssignment}
                    onRemoveItem={this.onRemoveSiteAssignment}
                    showAdd={this.state.showAddSiteAssignment}
                    toggleShowAdd={this.toggleShowAddSiteAssignment}
                    onFilterSiteAssignmentsChange={
                      this.onFilterSiteAssignmentsChange
                    }
                    onSaveSearchTerm={this.onSiteAssignmentSearchChange}
                    searchKeyword={this.state.searchKeyword}
                    disabled={this.props.disabled}
                  />
                )}
              </Tab>
            }
            <Tab eventKey={2} title={authenticationTabTitle}>
              <AuthenticationInfo
                data={this.props.selectedUser}
                isAdmin={this.props.isAdmin}
                disabled={this.props.disabled}
                isSelf={this.props.isSelf}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

TeamDetail.propTypes = propTypes
TeamDetail.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(TeamDetail)
