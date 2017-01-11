import React from "react"
import PropTypes from "prop-types"
import Label from "react-bootstrap/lib/Label"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import OverlayButton from "../../layout/OverlayButton"
import * as api from "../../../constants/api"
import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import { format } from "../../../utils/datetime"
import ResultWizard from "./resultsBehalf/ResultWizard"
import { ReactComponent as CalendarIcon } from "../../../assets/icons/brand/calendar.svg"


const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
  conclusions: [],
}

export default class ResourceConclusionForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      conclusions: [],
      isFetching: false,
      showResultWizard: false,
      conclusionTypes: [],
      customerCanClose: false,
    }

    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
  }

  componentDidMount() {
    this.getConclusions()
    this.getConclusionTypes()
    this.checkFinalizable()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getConclusions(nextProps.resource.JobResourceId)
    }
  }

  checkFinalizable = () => {
    const url = api.IS_FINALIAZBLE(this.props.jobId)

    this.props.auth
      .request("get", url)
      .query({ jobSourcingTierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const {
            body: { IsSuccess, FailedReasonCount, FailedReasons },
          } = response
          if (IsSuccess === true) {
            if (FailedReasonCount > 0) {
              const jobSpecificReasons = FailedReasons.filter(
                reason => reason.Name === "Job_Specific",
              )
              const reasonsWithNonCriticalDate = jobSpecificReasons.filter(
                reason =>
                  reason.ReasonByTestTypes.filter(
                    type => type.TestTypeId === 10,
                  ).length > 0,
              )

              if (reasonsWithNonCriticalDate.length > 0) {
                this.setState({ customerCanClose: false })
              }
            } else {
              this.setState({ customerCanClose: true })
            }
          } else {
            console.log("failed to check finalizable")
          }
        },
        () => {
          console.log("failed to check finalizable")
        },
      )
  }

  getConclusionTypes = () => {
    const url = api.GET_CONCLUSION_TYPES(this.props.data.ConclusionGroupId)

    this.props.auth.request("get", url).then(
      response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess === true) {
          this.setState({ conclusionTypes: response.body.Conclusions })
        } else {
          console.log("failed to get conclusion types")
        }
      },
      () => {
        console.log("failed to get conclusion types")
      },
    )
  }

  getConclusions(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.CONCLUSION_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ conclusions: response.body.Conclusions })
          } else {
            console.log("failed to get results")
          }
        },
        () => {
          console.log("failed to get results")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  uploadedByFormatter(conclusion) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {conclusion.IsLastUpdatedByMobile
          ? "Uploaded via mobile"
          : "Uploaded via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="uploadOffLineToolTip">
        {conclusion.IsLastUpdatedByOffLineSync
          ? "Data capture occurred without connectivity"
          : "Data capture occurred with connectivity"}
      </Tooltip>
    )

    var format = " "
    return (
      <span>
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon
            glyph={conclusion.IsLastUpdatedByMobile ? "phone" : "blackboard"}
          />
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger placement="top" overlay={offLineToolTip}>
          <Glyphicon
            glyph={
              conclusion.IsLastUpdatedByOffLineSync
                ? "cloud-download"
                : "cloud-upload"
            }
          />
        </OverlayTrigger>
        {format}
      </span>
    )
  }

  handleOnHideResultWizard = success => {
    this.setState({ showResultWizard: false })

    if (success) {
      this.getConclusions()
    }
  }

  render() {
    const className = "conclusion-table"
    const emptyTitle =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "No resource result!"
        : "No job result!"

    const emptyMesg =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "Subcontractor has not uploaded a result for this resource at this time."
        : "Subcontractor has not uploaded a result for job at this time."

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp; Fetching results...
        </Alert>
      )
    }

    if (
      this.state.conclusions === undefined ||
      this.state.conclusions.length === 0
    ) {
      return (
        <div className={className}>
          {this.state.showResultWizard && (
            <ResultWizard
              updateSignOff={this.props.updateSignOff}
              confirmStepRequired={false}
              reviewStepRequired={false}
              auth={this.props.auth}
              jobId={this.props.jobId}
              tierId={this.props.tierId}
              conclusionItems={this.state.conclusionTypes}
              results={this.state.conclusions}
              onHide={this.handleOnHideResultWizard}
              resources={this.props.data.Resources}
              resultOnBehalf={this.props.data.Job_IsResultOnBehalfAllowed}
            />
          )}
          <EmptyStateContainer
            alertStyle="info"
            title={emptyTitle}
            message={emptyMesg}
          />
          {this.state.customerCanClose && (
            <OverlayButton
              bsStyle="primary"
              bsClass="complete-button"
              text="Set the result on behalf of the vendor"
              onClick={() => {
                this.setState({ showResultWizard: true })
              }}
            >
              <CalendarIcon /> Complete Job
            </OverlayButton>
          )}
        </div>
      )
    }

    const conclusion = this.state.conclusions[0]

    return (
      <div>
        <p class="title-separator"><span>Result</span></p>
        {this.state.conclusions !== undefined &&
          this.state.conclusions.length === 1 && (
            <ul className="list-blocks">
              <li>
                <p>
                  <span>
                    <Label bsClass="label" bsStyle="primary" className="short">
                      {conclusion.ConclusionStatus}
                    </Label><br/>
                  </span>
                  <span style={{paddingTop: '5px'}}>Result</span>
                </p>
                <p>
                  <strong>
                    {conclusion.Comment === null ||
                      conclusion.Comment.length === 0 ? (
                        <span className="meta">No comment submitted</span>
                      ) : (
                        conclusion.Comment
                      )}
                  </strong>
                  <span>Comment</span>
                </p>
                <p>
                  <strong>{conclusion.LastUpdatedBy} on {format(conclusion.CollectedOn, "l LT")}&nbsp;
                  {conclusion.SiteTimeZoneShortName}</strong>
                  <span>Completed by <span className="icons-color">{this.uploadedByFormatter(conclusion)}</span></span>
                </p>
              </li>
            </ul>
          )}
      </div>
    )
  }
}

ResourceConclusionForm.propTypes = propTypes
ResourceConclusionForm.defaultProps = defaultProps
