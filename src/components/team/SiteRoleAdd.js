import React, { Component } from "react"
import { Modal, Button, ButtonToolbar } from "react-bootstrap"
import { notify } from "react-notify-toast"
import Formsy, { addValidationRule } from "formsy-react"
import {
  Row,
  Select,
  Input,
  RadioGroup,
  Textarea,
} from "formsy-react-components"
import request from "superagent"
import * as api from "../../constants/api"

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) return true

  return false
})

class SiteRoleAdd extends Component {
  constructor(props) {
    super(props)

    this.state = {
      roleTypes: [],
      canSubmit: false,
      title: this.props.row === null ? "Add Site Role" : "Edit Site Role",
      roleTypeId: this.props.row === null ? 0 : this.props.row.RoleTypeId,
      siteId: this.props.row === null ? 0 : this.props.row.AccountSiteId,
      sites: [],
      address: this.props.row === null ? "" : this.props.row.Address,
      currentPage: 1,
      pageSize: 100,
      totalDataSize: 0,
    }

    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
    this.handleCloseClick = this.handleCloseClick.bind(this)
    this.getRoles = this.getRoles.bind(this)
    this.getSites = this.getSites.bind(this)
    this.onSiteChange = this.onSiteChange.bind(this)
  }

  componentWillMount() {
    this.getRoles()
    this.getSites()
  }

  getRoles() {
    let url = api.CONTACT_ROLES
    this.props.auth
      .request("get", url)
      .query({ roleType: "Site" })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          this.setState({ roleTypes: response.body })
        },
        failure => {
          console.log("failure to get role types")
        },
      )
  }

  getSites() {
    request
      .post(api.CUSTOMER_SITES)
      .set(api.AUTH_HEADER_AUTH0, this.props.auth.getToken())
      .set(api.AUTH_HEADER_VITRALOGY, this.props.auth.getVasToken())
      .send({
        SearchParameters: { SiteName: "" },
        PageRequest: {
          PageSize: this.state.pageSize,
          PageNumber: this.state.currentPage,
        },
      })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess == true) {
            this.setState({
              sites: response.body.AccountSites,
              totalDataSize: response.body.TotalCount,
            })
          } else {
            notify.show("Error retrieving sites", "error")
          }
        },
        failure => {
          notify.show("Error retrieving sites", "error")
        },
      )
  }

  handleCloseClick() {
    this.props.onCloseClick()
  }

  submitForm(data) {
    //console.log('submitForm:' + JSON.stringify(data))
    this.props.onRoleSubmit(data)
  }

  enableSubmit() {
    this.setState({ canSubmit: true })
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  onSiteChange(name, value) {
    //console.log('value: ' + value)
    var sites = this.state.sites
    var site = sites.filter(function(i) {
      return i.AccountSiteId === parseInt(value)
    })
    //console.log('site: ' + JSON.stringify(site))
    this.setState({
      address: site.length ? site[0].Address : "",
    })
  }

  render() {
    var options = this.state.roleTypes.map(function(type) {
      return {
        value: type.ItemId,
        label: type.Value,
      }
    })

    options.unshift({ value: 0, label: "Select role..." })

    var siteOptions = this.state.sites.map(function(site) {
      return {
        value: site.AccountSiteId,
        label: site.Name,
      }
    })

    siteOptions.unshift({ value: 0, label: "Select site..." })

    return (
      <div className="team-add">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formsy
              onSubmit={this.submitForm}
              disabled={this.state.disabled}
              onValid={this.enableSubmit}
              onInvalid={this.disableSubmit}
              ref={input => {
                this.myform = input
              }}
            >
              <Select
                name="roleTypeId"
                id="roleTypeId"
                label="Role"
                value={this.state.roleTypeId}
                options={options}
                validations="isNonZero"
                required
              />
              <Select
                name="siteId"
                id="siteId"
                label="Site"
                value={this.state.siteId}
                options={siteOptions}
                validations="isNonZero"
                onChange={this.onSiteChange}
                required
              />
              <Textarea
                rows={3}
                cols={40}
                name="address"
                id="address"
                value={this.state.address}
                label="Address"
                disabled={true}
                placeholder=""
              />
              <Row>
                <ButtonToolbar>
                  <Button
                    bsStyle="primary"
                    bsSize="small"
                    disabled={!this.state.canSubmit}
                    formNoValidate={true}
                    type="submit"
                  >
                    Submit
                  </Button>
                  <Button
                    bsStyle="primary"
                    bsSize="small"
                    onClick={this.handleCloseClick}
                  >
                    {" "}
                    Cancel
                  </Button>
                </ButtonToolbar>
              </Row>
            </Formsy>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default SiteRoleAdd
