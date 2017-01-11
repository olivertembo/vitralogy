import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Form from "react-bootstrap/lib/Form"
import FormGroup from "react-bootstrap/lib/FormGroup"
import Alert from "react-bootstrap/lib/Alert"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import Select from "react-select"
import CompleteJobButton from "./CompleteJobButton"


//import { getTranslate } from "react-localize-redux";

import CheckInOutTable from "./CheckInOutTable"
import ResourceItem from "./ResourceItem"
import CheckListContainer from "../../containers/CheckListContainer"
import ResourceProgress from "./ResourceProgress"
import ResourceGroupPanel from "./ResourceGroupPanel"
//import SignOff from './SignOff'
import FinalizeTable from "./FinalizeTable"
import {
  selectResource,
  getResourceCorrectiveAction,
} from "../../actions/resources"
import * as api from "../../constants/api"
import JobReports from "./JobReports"
import { ReactComponent as YeyIcon } from "../../assets/icons/brand/eye.svg"


// import "react-select/dist/react-select.css"

const propTypes = {
  data: PropTypes.object,
  auth: PropTypes.object,
  flags: PropTypes.object,
  jobReports: PropTypes.array,
  resourceGroupData: PropTypes.object,
}

const defaultProps = {
  data: {},
  auth: {},
  flags: {},
  jobReports: [],
}

const getState = state => {
  return {
    _resource: { ...state.resources },
    _jobs: { ...state.jobs },
    // translate: getTranslate(state.locale),
  }
}

const getActions = dispatch => {
  return {
    selectResource: resource => dispatch(selectResource(resource)),
    getResourceCorrectiveAction: () => dispatch(getResourceCorrectiveAction()),
  }
}

const panels = {
  none: 0,
  prerequisites: 1,
  data: 2,
  checkins: 3,
  checkouts: 4,
  signoff: 5,
  reports: 6,
  resource_group: 7,
}

const TABS_ALIASES = {
  report: 'report',
  checklist: 'checklist',
  checkInOut: 'checkInOut',
  resourceType: 'resourceType',
  workOrder: 'workOrder',
  signOff: 'signOff'
}

class DataPanels extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      defaultPanel: panels.data,
      prereqAccepted: false,
      checkInOutItems: [],
      workOrderError: false,
      workOrderPanelOpen: false,
      activeTab: ''
    }
  }

  componentDidMount() {
    const { IsPrereq, IsLive } = this.props.flags
    const { IsCancelled, Resources, ResourceSupportModeId } = this.props.data
    const CanceledOrUpcoming = IsCancelled === true || IsLive === false
    let { defaultPanel } = this.state
    if (IsPrereq === false) {
      defaultPanel = panels.data
    }

    // Set resource selection here
    if (
      ResourceSupportModeId === api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      ResourceSupportModeId === api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
    ) {
      if (Resources.length > 0) {
        const firstResource = Resources[0]
        const resource = {
          value: firstResource,
          label: firstResource.Name,
        }

        this.changeResource(resource)
      } else {
        this.setState({ workOrderError: true })
        defaultPanel = panels.none
      }
    }

    if (CanceledOrUpcoming) {
      console.log("set default panel to none")
      defaultPanel = panels.none
    }

    console.log("default panel: " + defaultPanel)
    this.setState({ defaultPanel })

    if (
      ResourceSupportModeId === api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      ResourceSupportModeId === api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
    ) {
      if (Resources.length === 0) {
        this.setState({
          workOrderError: true,
          defaultPanel: panels.none,
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props._jobs.completeCheckData !== null &&
      nextProps._jobs.completeCheckData === null
    ) {
      this.setState({ defaultPanel: panels.signoff })
    }
  }

  changeResource = resource => {
    this.setState({
      selectedResource: resource.value,
    })

    this.props.selectResource(resource)
    if (this.props.data.IsCorrectiveAction === true) {
      this.props.getResourceCorrectiveAction()
    }
  }

  onSelectResource = resource => {
    this.changeResource(resource)
  }

  onSelectPanel = activeKey => {
    this.setState({ defaultPanel: activeKey })
  }

  getSummaryReport = () => {
    const { data, jobReports } = this.props

    if (!jobReports || jobReports.length === 0) return null

    let reportType = api.JOB_REPORT_TYPE.JOB_DETAILS
    if (data.IsAllowPostCloseChanges) {
      reportType = !data.IsPostCloseChangesCompleted
        ? api.JOB_REPORT_TYPE.JOB_DETAILS_ON_BEHALF
        : api.JOB_REPORT_TYPE.JOB_DETAILS
    }

    const summaryReport = jobReports.filter(function(report) {
      return report["JobReportTypeId"] === reportType
    })[0]
    return summaryReport
  }

  getStyleStatus = summaryReport => {
    const { data } = this.props
    let status = "success"
    if (data.IsAllowPostCloseChanges) {
      if (data.IsPostCloseChangesCompleted) {
        status = "warning"
      } else {
        status = "danger"
      }
    } else {
      if (summaryReport === null) {
        status = "info"
      }
    }
    return status
  }

  downloadReport = summaryReport => {
    //const fileName = `${
    //  this.props.data.JobNumber
    //}-${this.props.data.ActivityTypeName.replace(/\s+/g, "")}-JobSummary.pdf`;
    this.props.auth.downloadFile(summaryReport.Url, summaryReport.FileName)
  }

  signOffPanelClosed = () => {
    //this.props.onSignOffPanelToggled(false)
  }

  signOffPanelOpened = () => {
    // if (this.props.data.ActiveVendorIsFinalized !== true) {
    //   this.props.checkJobComplete(false);
    //   //this.props.onSignOffPanelToggled(true)
    // }
  }

  handleTabChange = tabAlias => e => {
    this.setState({
      activeTab: tabAlias
    })
  }

  render() {
    if (this.props.data.JobId === 0) {
      return <div>Loading ...</div>
    }

    const props = {
      jobId: this.props.data.JobId,
      auth: this.props.auth,
      tierId: this.props.data.ActiveTierId,
      finalized: this.props.data.ActiveVendorIsFinalized,
      isLocked: this.props.isLocked,
      lockedReason: this.props.lockedReason,
      flags: this.props.flags,
      resourceSupportModeId: this.props.data.ResourceSupportModeId,
    }

    const { activeTab } = this.state

    let resourceFilter = <div />

    if (
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
    ) {
      const resourceOptions = this.props.data.Resources.map(item => {
        const label = item.Name
        return { value: item, label }
      })

      resourceFilter = (
        <div>
          <section className="progress-section">
                <Form>
                  <FormGroup
                    controlId="formControlsSelect"
                    className="formControlsSelect"
                  >
                    <Select
                      name="select-resource"
                      placeholder="Select resource..."
                      clearable={false}
                      options={resourceOptions}
                      onChange={this.onSelectResource}
                      value={this.props._resource.selected}
                    />
                  </FormGroup>
                </Form>
                {this.props._resource.selected && (
                  <ResourceProgress flags={this.props.flags} />
                )}
          </section>
        </div>
      )
    }

    // Disable certain panels if the prerequisites (if enabled on job)
    // have not been accepted yet
    // Or if outside the scheduled date range
    const upcoming = this.props.flags.IsLive === false
    let panelClassName = null
    const missingPrereq = false //this.props.flags.IsPrereq === true && this.state.prereqAccepted === false
    //const tr = this.props.translate;

    let missingPrereqPanelTitle = ""
    if (missingPrereq) {
      missingPrereqPanelTitle = " (disabled until Prerequisites reviewed)"
      panelClassName = "panel-disabled"
    }
    if (
      this.state.workOrderError === true ||
      this.props.data.IsCancelled === true
    ) {
      panelClassName = "panel-disabled"
    }
    if (upcoming === true || this.props.data.IsCancelled === true) {
      panelClassName = "panel-disabled"
    }

    let signOffPanelClassName = panelClassName
    if (signOffPanelClassName === null) {
      if (upcoming === true) {
        signOffPanelClassName = "panel-disabled"
      }
    }

    const resourceData =
      this.props._resource.selected === null
        ? null
        : this.props._resource.selected.value
    const jobReportToolTip = (
      <Tooltip id="report-tooltip" placement="top">
        Click to download Job Summary Report
      </Tooltip>
    )
    const summaryReport = this.getSummaryReport()
    const style = this.getStyleStatus(summaryReport)

    const tabsMap = [
      {
        name: 'Vitralogy Reports',
        alias: TABS_ALIASES.report,
        showCondition: this.props.jobReports != null &&
          this.props.jobReports.length >= 1 &&
          !this.props.flags.IsBackEnd ,
      }, {
        name: 'Prerequisite Checklist',
        alias: TABS_ALIASES.checklist,
        showCondition: this.props.flags.IsPrereq,
      }, {
        name: 'Check Ins / Outs '+missingPrereqPanelTitle,
        alias: TABS_ALIASES.checkInOut,
        showCondition: this.props.flags.IsCheckinRequired
      }, {
        name: this.props.resourceGroupData.assets.length > 0
          ? ` ${this.props.data.ResourceType} (${this.props.resourceGroupData.assets.length})`
          : ` ${this.props.data.ResourceType}`,
        alias: TABS_ALIASES.resourceType,
        showCondition: this.props.data.ResourceSupportModeId ===
          api.RESOURCE_SUPPORT_MODE.CONTAINER &&
          this.props.flags.IsResourceGroupEnabled
      },  {
        name: 'Work Order '+ missingPrereqPanelTitle,
        alias: TABS_ALIASES.workOrder,
        showCondition: true,
      },  {
        name: 'Sign Off'+ missingPrereqPanelTitle,
        alias: TABS_ALIASES.signOff,
        showCondition: true,
      }
    ]

    if (!activeTab) {
      this.setState({
        activeTab: tabsMap.find(tab => tab.showCondition).alias
      })
    }

    return (
      <div>
        <div className="job-id">
          <p>{this.props.data.JobNumber}</p>
          {resourceData && <CompleteJobButton
            {...props}
            updateSignOff={this.props.updateSignOff}
            data={this.props.data}
            flags={this.props.flags}
            resource={resourceData}
            JobResourceId={resourceData && resourceData.JobResourceId}
          />}
        </div>
        <div className="job-detail__content-wrapper container-fluid">
          {this.state.workOrderError && (
            <Alert bsStyle="warning">
              <Icon name="exclamation-circle" />{" "}
              <strong>Work Order Error:</strong> An issue exists with this work
              order, please contact Vitralogy Support with the details of this
              job.
            </Alert>
          )}

          {this.props.data.IsCancelled && this.state.workOrderError === false && (
            <Alert bsStyle="warning">
              <Icon name="ban" /> <strong>Work Order Canceled:</strong> This work
              order is in a canceled state.
            </Alert>
          )}

          {upcoming && (
            <Alert bsStyle="warning">
              <Icon name="exclamation-circle" />{" "}
              <strong>Work Order Upcoming:</strong> This work order is currently
              not active.
            </Alert>
          )}

          {this.props.data.ActiveVendorIsFinalized &&
            this.props.data.IsComplete &&
            this.state.workOrderError === false && (
              <Alert bsStyle={style}>
                <Icon
                  name={summaryReport === null ? "check" : "exclamation-triangle"}
                />
                &nbsp;
                <strong>Job Completed:</strong>&nbsp;
                {!this.props.data.IsAllowPostCloseChanges && (
                  <span>
                    {summaryReport === null
                      ? "This job is in a completed state."
                      : "Summary Report Available "}
                  </span>
                )}
                {this.props.data.IsAllowPostCloseChanges && (
                  <span>
                    {this.props.data.IsPostCloseChangesCompleted && (
                      <span>
                        {summaryReport === null
                          ? "This job is in a completed state (via post close)."
                          : "Summary Report (Post Close) Available "}
                      </span>
                    )}
                    {!this.props.data.IsPostCloseChangesCompleted && (
                      <span>
                        {summaryReport === null
                          ? "This job is in a completed state (pending data entry)."
                          : "Summary Report (On Behalf) Available "}
                      </span>
                    )}
                  </span>
                )}
                {summaryReport !== null && (
                  <OverlayTrigger overlay={jobReportToolTip} placement="top">
                    <Button
                      bsStyle="link"
                      bsClass="btn-inline"
                      bsSize="xsmall"
                      onClick={() => this.downloadReport(summaryReport)}
                    >
                      <Icon name="file-pdf-o" />
                    </Button>
                  </OverlayTrigger>
                )}
              </Alert>
            )}
            <div className="job-tabs">
              {tabsMap.map(tab => {
                return tab.showCondition && <Button
                    bsClass="tab-label"
                    key={tab.alias}
                    className={activeTab === tab.alias && 'active'}
                    onClick={this.handleTabChange(tab.alias)}
                  >{tab.name} <YeyIcon/></Button>
              })}
            </div>
            <div className="tabs-body">
              {activeTab === TABS_ALIASES.report && <section className="tabSection">
                <JobReports
                  {...props}
                  flags={this.props.flags}
                  jobReports={this.props.jobReports}
                />
              </section>}
              {activeTab === TABS_ALIASES.checklist && <section className="tabSection">
                <CheckListContainer
                    {...props}
                    jobResourceId={null}
                    getType={api.CheckListTypeEnum.PREREQUISITE_ONLY}
                  />
              </section>}
              {activeTab === TABS_ALIASES.checkInOut && <section className="tabSection">
                <CheckInOutTable {...props} />
              </section>}
              {activeTab === TABS_ALIASES.resourceType && <section className="tabSection">
                <ResourceGroupPanel
                  data={this.props.resourceGroupData}
                  details={this.props.data}
                />
              </section>}
              {activeTab === TABS_ALIASES.workOrder && <section>
                <ResourceItem
                  {...props}
                  updateSignOff={this.props.updateSignOff}
                  stepDocumentTypes={this.props.stepDocumentTypes}
                  panelOpen={this.state.workOrderPanelOpen}
                  resource={resourceData}
                  data={this.props.data}
                  flags={this.props.flags}
                  resourceFilter={resourceFilter}
                />
              </section>}
              {activeTab === TABS_ALIASES.signOff && <section className="tabSection">
                <FinalizeTable
                  {...props}
                  data={this.props.data}
                  key={this.props.data.JobSerial}
                />
              </section>}
            </div>
        </div>
      </div>
    )
  }
}

DataPanels.propTypes = propTypes
DataPanels.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(DataPanels)
