import React from "react"
import moment from "moment"
import ReactTimeout from "react-timeout"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import { camelizeKeys } from "humps"
import Formsy from "formsy-react"
import FormsyDateTime from "../../../formsyWrappers/FormsyDateTime"
import { Select, Textarea } from "formsy-react-components"

import * as api from "../../../../constants/api"
// import { updateTierDetails } from "../../../../actions/jobDetails"
import ToastHelper from "../../../../utils/ToastHelper"

// const getActions = dispatch => {
//   return {
//     updateTierDetails: payload => dispatch(updateTierDetails(payload)),
//   }
// }

class Form extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canSubmit: false,
      isPosting: false,
      withError: false,
      submitConfirmed: false,
    }
  }

  onSubmit = formData => {
    if (this.props.isFinalStep && this.state.submitConfirmed === false) {
      this.setState({ submitConfirmed: true })
      return
    }

    this.setState({ isPosting: true })
    // let { discrepancy } = formData
    // if (discrepancy === undefined) {
    //   discrepancy = null
    // }
    // const isDiscrepancy = discrepancy ? true : false
    const statusId = Number(formData.results)
    let conclusions = null
    if (this.props.resources === null || this.props.resources.length === 0) {
      conclusions = [{ statusId }]
    } else {
      conclusions = this.props.resources.map(x => {
        return {
          jobResourceId: x.JobResourceId,
          statusId,
        }
      })
    }

    const collectedOn = formData.datetime

    // POST to API
    const data = {
      methodId: 1, // TODO change from form
      jobSourcingTierId: this.props.tierId,
      conclusions,
      collectedOn: collectedOn.format(),
      internalComment: formData.comment,
    }

    let url = api.SIGN_OFF_ON_BEHALF(this.props.jobId)
    if (this.props.resultOnBehalf) {
      url = api.RESULT_ON_BEHALF_FINALIZE(this.props.jobId)
    }

    this.props.auth
      .request("post", url)
      .send(data)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        const camelizedJson = camelizeKeys(response.body)
        const { isSuccess } = camelizedJson
        if (isSuccess) {
          // on success call save values
          // go to next step if there is one

          // Find the on behalf name for display
          // const resultForId = Number(formData.resultFor)
          const resultForName = this.props.displayName //this.props.team.find(x => x.UserAccountId === resultForId).Name

          // Find the result name for display
          const resultId = Number(formData.results)
          const resultName = this.props.conclusionItems.find(
            x => x.ConclusionStatusId === resultId,
          ).Name

          const result = Object.assign({}, formData, {
            resultName,
            resultForName,
            createdByName: this.props.displayName,
            createdById: this.props.userAccountId,
          })

          const updateData = {
            Status: camelizedJson.jobStatus,
            StatusId: camelizedJson.jobStatusId,
            Reason: camelizedJson.jobReason,
            ReasonId: camelizedJson.jobReasonId,
            JobSerial: camelizedJson.jobSerial,
            StatusReason: `${camelizedJson.jobStatus} / ${
              camelizedJson.jobReason
            }`,
            ActiveVendorIsFinalized: true,
            ActiveVendorFinalizedDate: camelizedJson.finalizedDate,
            ActiveVendorFinalizedBy: camelizedJson.finalizeItems[0].forUser,
            ActiveVendorProgressId: 4,
            ActiveVendorVendorProgress: "Signed Off",
            IsComplete: true,
            ActiveVendorScheduledDate: camelizedJson.finalizedDate,
          }
          this.props.updateSignOff(updateData)

          // Update the top level job props
          // this.props.updateJobProps({
          //   RowVersion: camelizedJson.jobSerial,
          //   Row_Version: camelizedJson.jobSerial,
          //   StatusId: camelizedJson.jobStatusId,
          //   ReasonId: camelizedJson.jobReasonId,
          //   Status: camelizedJson.jobStatus,
          //   Reason: camelizedJson.jobReason,
          //   StatusReason: `${camelizedJson.jobStatus} / ${camelizedJson.jobReason}`,
          // })

          // Update the child tier props
          // this.props.updateTierDetails({
          //   IsFinalized: camelizedJson.isFinalized,
          //   FinalizedOn: camelizedJson.finalizedDate,
          //   Status: camelizedJson.status,
          //   StatusId: camelizedJson.statusId,
          //   Reason: camelizedJson.reason,
          //   ReasonId: camelizedJson.reasonId,
          //   RowVersion: camelizedJson.serial,
          //   Row_Version: camelizedJson.serial,
          // })

          // Update the tier finalize items

          // Update the tier conclusion items
          this.props.resultSubmitted(isSuccess)

          // Save the values and move to next step
          this.props.saveValues({ result, discrepancy: null })
          this.props.nextStep()
        } else {
          this.props.resultSubmitted(isSuccess)
          this.setState({ isPosting: false, withError: true })
          ToastHelper.error(camelizedJson.msg)
          this.props.setTimeout(this.clearError, 5000)
        }
      })
  }

  clearError = () => {
    this.setState({ withError: false })
  }

  onCancelClick = () => {
    if (this.state.submitConfirmed === true) {
      this.setState({ submitConfirmed: false })
    } else {
      this.props.onCancelClick(false)
    }
  }

  render() {
    // const { isDiscrepancy } = this.props.fieldValues
    // const teamOptions = this.props.team.map(member => {
    //   return {
    //     value: member.UserAccountId.toString(),
    //     label: member.Name,
    //     disabled: member.IsActive === false,
    //   }
    // })

    // teamOptions.unshift({
    //   value: "0",
    //   label: `Select ${isDiscrepancy ? "new " : ""}vendor user...`,
    // })

    const resultOptions = this.props.conclusionItems.map(c => {
      return { value: c.ConclusionStatusId.toString(), label: c.Name }
    })

    resultOptions.unshift({
      value: "0",
      label: `Select result...`,
    })

    return (
      <div className="result-form">
        <Formsy
          onSubmit={this.onSubmit}
          onValid={() => {
            this.setState({ canSubmit: true })
          }}
          onInvalid={() => {
            this.setState({ canSubmit: false })
          }}
        >
          <Select
            name="results"
            id="results"
            label="Result"
            options={resultOptions}
            required
          />
          <FormsyDateTime
            value={moment(
              this.props.isRecurrenceEvaluationRequired &&
                this.props.recurrenceReferenceDate
                ? this.props.recurrenceReferenceDate
                : this.props.scheduledDate,
            )}
            name="datetime"
            label="Date/Time"
            isValidDate={() => {
              return true
            }}
            required
            inputProps={{
              disabled:
                this.props.isRecurrenceEvaluationRequired &&
                this.props.recurrenceReferenceDate,
            }}
          />
          <Textarea
            rows={3}
            cols={40}
            name="comment"
            label="Comment"
            placeholder={`Document results and whom you spoke to.`}
            required
          />
          <ButtonToolbar>
            <Button
              className="pull-right"
              bsStyle={this.state.submitConfirmed ? "success" : "primary"}
              disabled={
                this.state.canSubmit === false ||
                this.state.isPosting ||
                this.state.withError
              }
              type="submit"
            >
              {this.state.isPosting ? (
                <span>
                  <Icon spin name="spinner" /> Submitting...
                </span>
              ) : this.props.isFinalStep ? (
                this.state.submitConfirmed ? (
                  "Confirm"
                ) : (
                  "Submit"
                )
              ) : (
                "Next"
              )}
            </Button>
            <Button
              className="pull-right"
              onClick={this.onCancelClick}
              disabled={this.state.isPosting}
            >
              Cancel
            </Button>
          </ButtonToolbar>
        </Formsy>
      </div>
    )
  }
}

export default ReactTimeout(Form)

// export default ReactTimeout(
//   connect(
//     null,
//     getActions,
//     null,
//     {
//       areStatesEqual: (next, prev) => {
//         return prev.jobdetails === next.jobdetails
//       },
//     },
//   )(Form),
// )
