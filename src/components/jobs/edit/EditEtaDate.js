import React from "react"
import Modal from "react-bootstrap/lib/Modal"
import Button from "react-bootstrap/lib/Button"
import Formsy from "formsy-react"
import { Input } from "formsy-react-components"
import Icon from "react-fa/lib/Icon"
import moment from "moment"
import Result from "antd/lib/result"
import Typography from "antd/lib/typography"

import * as api from "../../../constants/api"
import FormsyFroala from "../../formsyWrappers/FormsyFroala"
import FormsyDateTime from "../../formsyWrappers/FormsyDateTime"
import { format } from "../../../utils/datetime"

const { Paragraph, Text } = Typography

export default class EditEtaDate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      errMsg: "",
      isPosting: false,
      canSubmit: false,
    }
  }

  close = () => {
    this.setState({ hasError: false, errMsg: "" }, this.props.onHide())
  }

  submitForm = formData => {
    this.setState({ isPosting: true })

    let customerEtaDate = moment(formData.datetime).format()
    let data = {
      jobId: this.props.jobId,
      customerEtaDate: customerEtaDate,
      serial: this.props.rowversion,
      reason: formData.changeReason,
    }
    //console.log('submitForm:', JSON.stringify(data))

    const url = api.CUSTOMER_SET_JOB_ETA_DATE;
    this.props.auth
      .request("post", url)
      .send(data)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            let result = {
              opResult: response.body.IsSuccess,
              message: response.body.Msg,
              eta: customerEtaDate,
              rowversion: response.body.Serial,
            }

            this.props.onDateSubmit(result)
            this.props.onHide()
          } else {
            this.setState({
              isPosting: false,
              hasError: true,
              errMsg: response.body.Msg,
            })
          }
        },
        failure => {
          this.setState({
            isPosting: false,
            hasError: true,
            errMsg: "Fail to submit eta change",
          })
        },
      )
  }

  enableSubmit = () => {
    this.setState({ canSubmit: true })
  }

  disableSubmit = () => {
    this.setState({ canSubmit: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="job-edit-eta-date">
          <Modal backdrop="static" show={this.props.show} onHide={this.props.onHide}>
            <Modal.Header closeButton>
              <Modal.Title>Edit ETA Date</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Result
                status="error"
                //icon={<Icon name="times-circle" size="5x" style={{ color: "rgb(245,34,45)" }} />}
                title="ETA Update Failed"
                subTitle={`Fail to change eta date`}
              >
                <div className="desc">
                  <Paragraph>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                      }}
                    >
                      The request you submitted has the following error:
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    <Icon style={{ color: "red" }} name="times-circle-o" />
                    {` ${this.state.errMsg}`}
                  </Paragraph>
                </div>
              </Result>
              <Modal.Footer>
                <Button bsStyle="success" onClick={this.props.onHide}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Body>
          </Modal>
        </div>
      )
    }

    const currentTime =
      this.props.initialDate !== null
        ? `${format(this.props.initialDate, "MM/DD/YYYY hh:mm A")} ${this.props.timezone}`
        : ""

    return (
      <div className="job-edit-eta-date">
        <Modal backdrop="static" show={this.props.show} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Edit ETA Date</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formsy
              onSubmit={this.submitForm}
              onValid={this.enableSubmit}
              onInvalid={this.disableSubmit}
              ref="myform"
            >
              <Input
                name="currentDate"
                id="currentDate"
                label="Current:"
                type="text"
                value={currentTime}
                readOnly
              />

              <FormsyDateTime
                //value={this.state.date}
                name="datetime"
                label="New Date/Time:"
                isValidDate={date => {
                  return date
                }}
                input={true}
                timeFormat={true}
                required
              />

              <FormsyFroala
                name="changeReason"
                licenseKey={api.FROALA_KEY}
                placeholder="Enter description for changing eta"
                label="Explanation:"
                validations={{
                  minLength: 17,
                }}
                validationErrors={{
                  minLength: "Description for altering eta required, minimum of 10 characters",
                }}
                required
              />

              <Modal.Footer>
                <Button onClick={this.props.onHide} disabled={this.state.isPosting}>
                  {" "}
                  Cancel
                </Button>
                <Button
                  bsStyle="primary"
                  //disabled={this.state.isPosting || isDateDifferent === false}
                  disabled={!this.state.canSubmit || this.state.isPosting}
                  formNoValidate={true}
                  type="submit"
                >
                  {this.state.isPosting ? (
                    <span>
                      <Icon spin name="spinner" /> Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Modal.Footer>
            </Formsy>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}
