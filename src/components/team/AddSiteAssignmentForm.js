import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import Modal from "react-bootstrap/lib/Modal"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Icon from "react-fa/lib/Icon"
import Formsy from "formsy-react"
import { Select } from "formsy-react-components"
import FormsyTypeahead from "../formsyWrappers/FormsyTypeahead"

const propTypes = {
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  emailTypes: PropTypes.arrayOf(PropTypes.object),
  phoneTypes: PropTypes.arrayOf(PropTypes.object),
  customerSiteOptions: PropTypes.arrayOf(PropTypes.object),
  isPosting: PropTypes.bool,
}

const defaultProps = {
  emailTypes: [],
  phoneTypes: [],
  customerSiteOptions: [],
  isPosting: false,
}

export default class AddSiteAssignmentForm extends React.Component {
  state = {
    canSubmit: false,
    disabled: false,
    selectedCustomer: null,
    selectedSites: null,
  }

  onCancelClick = () => {
    this.props.onHide()
  }

  onSelectCustomer = (name, customerId) => {
    const selectedCustomer = Number(customerId)
    this.setState({ selectedCustomer })
  }

  submitForm = () => {
    const model = this.myform.getModel()
    const data = {
      customerId: model.customerId,
      customerSiteId: model.customerSiteId.map(x => x.id),
    }
    this.props.onSubmit(data)
  }

  enableSubmit = () => {
    this.setState({ canSubmit: true })
  }

  disableSubmit = () => {
    this.setState({ canSubmit: false })
  }

  render() {
    const { selectedCustomer } = this.state
    const customerOptions = this.props.customerSiteOptions.map(item => {
      return { label: item.CustomerName, value: item.CustomerId.toString() }
    })
    customerOptions.unshift({ label: "Select customer...", value: "" })

    let siteOptions = []
    if (selectedCustomer !== null) {
      const findCustomer = this.props.customerSiteOptions.find(
        x => x.CustomerId === selectedCustomer,
      )

      siteOptions = findCustomer.Sites.map(item => {
        return { label: item.AccountSiteName, id: item.CustomerSiteId }
      })
    }

    return (
      <div className="add-site-assignment-form">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.onCancelClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Site Assignments</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formsy
              onSubmit={this.submitForm}
              disabled={this.state.disabled}
              onValid={this.enableSubmit}
              onInvalid={this.disableSubmit}
              onChange={this.onChange}
              ref={input => {
                this.myform = input
              }}
            >
              <Select
                name="customerId"
                id="customerId"
                label="Customer"
                options={customerOptions}
                onChange={this.onSelectCustomer}
                required
              />
              <FormsyTypeahead
                name="customerSiteId"
                id="customerSiteId"
                label="Sites"
                placeholder="Select site(s)..."
                multiple={true}
                options={siteOptions}
                required
              />
              {/* <div className="col-md-3">
                Site(s):
              </div>
              <div className="col-md-9">
                <Typeahead
                  placeholder="Select site(s)..."
                  multiple={true}
                  onChange={(selected) => {
                    // handle selections
                    console.log(selected)
                    this.setState({ selectedSites: selected.map(x => x.id) })
                  }}
                  options={siteOptions}
                />
              </div> */}
            </Formsy>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="primary"
                bsSize="small"
                className="pull-right"
                disabled={!this.state.canSubmit || this.props.isPosting}
                formNoValidate={true}
                onClick={this.submitForm}
              >
                {this.props.isPosting === true ? (
                  <span>
                    <Icon spin name="spinner" /> Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                bsStyle="default"
                bsSize="small"
                className="pull-right"
                onClick={this.onCancelClick}
                disabled={this.props.isPosting}
              >
                Cancel
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

AddSiteAssignmentForm.propTypes = propTypes
AddSiteAssignmentForm.defaultProps = defaultProps
