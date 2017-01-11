import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Modal, Button, ButtonToolbar } from "react-bootstrap"
import Formsy from "formsy-react"
import { Select, Input } from "formsy-react-components"
import Icon from "react-fa/lib/Icon"

const propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onTeamSubmit: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  update: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool.isRequired,
}

const defaultProps = {
  readOnly: false,
}

const getState = state => {
  return {
    salutations: [...state.lookups.salutations],
    suffixes: [...state.lookups.suffixes],
  }
}

class TeamAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canSubmit: false,
      isPosting: false,
    }
  }

  handleCloseClick = () => {
    this.props.onCloseClick()
  }

  submitForm = () => {
    this.setState({ isPosting: true })
    const data = this.myform.getModel()
    this.props.onTeamSubmit(data)
  }

  enableSubmit = () => {
    this.setState({ canSubmit: true })
  }

  disableSubmit = () => {
    this.setState({ canSubmit: false })
  }

  render() {
    const prefixes = this.props.salutations.map(x => {
      return { value: x.ItemId.toString(), label: x.Value }
    })
    prefixes.unshift({ value: null, label: "Select saluation..." })

    const suffixes = this.props.suffixes.map(x => {
      return { value: x.ItemId.toString(), label: x.Value }
    })
    suffixes.unshift({ value: null, label: "Select suffix..." })

    const selected = this.props.selected || {}

    return (
      <div className="team-add">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>{`${
              this.props.update ? "Edit" : "Add"
            } Team Member`}</Modal.Title>
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
              {this.state.isPosting && (
                <p>
                  <Icon spin name="spinner" />{" "}
                  {this.props.update
                    ? "Submitting Team Update..."
                    : "Submitting Team Addition..."}
                </p>
              )}
              {!this.state.isPosting && (
                <span>
                  <Input
                    name="firstName"
                    id="firstName"
                    value={selected.FirstName}
                    label="First Name"
                    type="text"
                    required
                    disabled={this.props.readOnly}
                  />
                  <Input
                    name="middleName"
                    id="middleName"
                    value={selected.MiddleName}
                    label="Middle Name"
                    type="text"
                    disabled={this.props.readOnly}
                  />
                  <Input
                    name="lastName"
                    id="lastName"
                    value={selected.LastName}
                    label="Last Name"
                    type="text"
                    required
                    disabled={this.props.readOnly}
                  />
                  <Select
                    name="salutation"
                    id="salutation"
                    label="Salutation"
                    options={prefixes}
                    value={selected.SalutationId || ""}
                    disabled={this.props.readOnly}
                  />
                  <Select
                    name="suffix"
                    id="suffix"
                    label="Suffix"
                    value={selected.SuffixId || ""}
                    options={suffixes}
                    disabled={this.props.readOnly}
                  />
                </span>
              )}
            </Formsy>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="primary"
                bsSize="small"
                className="pull-right"
                disabled={
                  !this.state.canSubmit ||
                  this.props.readOnly ||
                  this.state.isPosting
                }
                formNoValidate={true}
                onClick={this.submitForm}
              >
                {this.state.isPosting ? (
                  <span>
                    <Icon spin name="spinner" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>

              <Button
                bsStyle="default"
                bsSize="small"
                className="pull-right"
                onClick={this.handleCloseClick}
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

TeamAdd.propTypes = propTypes
TeamAdd.defaultProps = defaultProps

export default connect(getState)(TeamAdd)
