import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Modal from "react-bootstrap/lib/Modal"
import Icon from "react-fa/lib/Icon"

import ResultForm from "./Form"
// import VendorConfirmation from "./Confirm";
// import Review from "./Review";
// import * as api from "../../../../constants/api"

const propTypes = {
  auth: PropTypes.object.isRequired,
}

const defaultProps = {}

const stepTitles = {
  1: "Result Details",
  // 2: "Vendor Confirmation",  // VES-6124 no vendor or review step
  // 3: "Review Results"
}

const METHOD_OPTIONS = [
  { methodId: 1, name: "Email" },
  { methodId: 2, name: "Phone" },
  { methodId: 3, name: "SMS" },
  { methodId: 4, name: "In App" },
]

const getState = state => ({
  userAccountId: state.userAccounts.userAccountId,
  displayName: state.userAccounts.displayName,
})

class ResultWizard extends React.Component {
  constructor(props) {
    super(props)

    // TODO depending on flags, change up steps
    // let numSteps = 1
    const steps = {
      1: ResultForm,
    }
    // if (props.confirmStepRequired) {
    //   numSteps += 1;
    //   steps[numSteps] = VendorConfirmation;
    // }
    // if (props.reviewStepRequired) {
    //   numSteps += 1;
    //   steps[numSteps] = Review;
    // }

    let result = {}
    let step = 1
    // let discrepancy = null;
    // let isDiscrepancy = props.correctionInitiated;
    // if (props.results.length > 0 && !props.correctionInitiated) {
    //   const priorResult = props.results[0];
    //   // discrepancy = priorResult.DiscrepancyComment;

    //   result = {
    //     datetime: priorResult.CollectedOn,
    //     resultName: priorResult.ConclusionStatus,
    //     resultForName: priorResult.ForUser,
    //     createdById: priorResult.CreatedById,
    //     createdByName: priorResult.CreatedBy,
    //     comment: priorResult.Comment
    //   };

    //   step = 2;
    // }

    // let confirmation = {};
    // if (props.confirm.confirmedOn !== null && !props.correctionInitiated) {
    //   const {
    //     confirmedByName,
    //     confirmedOn,
    //     methodName,
    //     methodId,
    //     createdByName,
    //     comment
    //   } = props.confirm;
    //   confirmation = {
    //     confirmedByName,
    //     confirmedOn,
    //     methodName,
    //     methodId,
    //     createdByName,
    //     comment
    //   };

    //   step = 3;
    // }

    this.state = {
      step,
      steps,
      fieldValues: {
        result,
        // confirmation,
        review: false,
        // discrepancy,
        // isDiscrepancy
      },
      isFetching: false,
      team: [],
      resultSuccess: false,
    }
  }

  componentDidMount() {
    // this.getData();
  }

  // async getData() {
  //   this.setState({
  //     isFetching: true
  //   });

  //   const [vendorTeam] = await Promise.all([this.getVendorTeam()]);

  //   if (vendorTeam.ok && vendorTeam.body.IsSuccess) {
  //     this.setState({
  //       team: vendorTeam.body.TeamList,
  //       isFetching: false
  //     });
  //   }
  // }

  // getVendorTeam = () => {
  //   const url = `${api.VENDOR_TEAM_ROOT}?jobSourcingTierId=${
  //     this.props.tierId
  //   }`;

  //   return new Promise((resolve, reject) => {
  //     this.props.auth.request("get", url).then(
  //       response => {
  //         resolve(response);
  //       },
  //       failure => {
  //         reject(failure);
  //       }
  //     );
  //   });
  // };

  onNextStep = () => {
    const numSteps = Object.keys(this.state.steps).length
    if (this.state.step === numSteps) {
      this.props.onHide(this.state.resultSuccess)
    } else {
      // Continue on to the next step
      this.setState({ step: this.state.step + 1 })
    }
  }

  onPreviousStep = () => {
    this.setState({ step: this.state.step - 1 })
  }

  onSetStep = step => {
    this.setState({ step })
  }

  onSaveValues = fields => {
    const fieldValues = Object.assign({}, this.state.fieldValues, fields)
    this.setState({ fieldValues })
  }

  onResultSubmitted = resultSuccess => {
    this.setState({ resultSuccess })
  }

  render() {
    const { step, steps, team, isFetching } = this.state
    const {
      auth,
      conclusionItems,
      resources,
      tierId,
      jobId,
      displayName,
      jobSerial,
      tierSerial,
      updateJobProps,
      userAccountId,
      confirmStepRequired,
      scheduledDate,
      resultOnBehalf,
      // recurrenceReferenceDate,
      // recurrenceOverwriteOn,
      // isRecurrenceEvaluationRequired,
      // toggleCorrectionRecurrenceOverwrite
    } = this.props
    const numSteps = Object.keys(steps).length
    const props = {
      auth,
      fieldValues: this.state.fieldValues,
      nextStep: this.onNextStep,
      previousStep: this.onPreviousStep,
      saveValues: this.onSaveValues,
      onCancelClick: this.props.onHide,
      setStep: this.onSetStep,
      team,
      conclusionItems,
      resources,
      tierId,
      jobId,
      isFinalStep: step === numSteps,
      displayName,
      userAccountId,
      jobSerial,
      tierSerial,
      updateJobProps,
      methodOptions: METHOD_OPTIONS,
      confirmStepRequired,
      resultSubmitted: this.onResultSubmitted,
      scheduledDate,
      resultOnBehalf,
      updateSignOff: this.props.updateSignOff,
      // recurrenceReferenceDate,
      // recurrenceOverwriteOn,
      // isRecurrenceEvaluationRequired,
      // toggleCorrectionRecurrenceOverwrite
    }
    const StepComponent = steps[step]

    // const displayStep =
    //   confirmStepRequired === false && step === 3 ? step - 1 : step

    return (
      <Modal
        dialogClassName="result-wizard-modal"
        show={true}
        onHide={() => {
          this.props.onHide(this.state.resultSuccess)
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Complete Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isFetching && (
            <p>
              <Icon spin name="spinner" /> Loading...
            </p>
          )}
          {!isFetching && (
            <span>
              <h1>
                {stepTitles[step]}{" "}
                {/* <small>
                  {displayStep} of {numSteps}
                </small> */}
              </h1>
              <StepComponent {...props} key={step} />
            </span>
          )}
        </Modal.Body>
      </Modal>
    )
  }
}

ResultWizard.propTypes = propTypes
ResultWizard.defaultProps = defaultProps

export default connect(getState)(ResultWizard)
