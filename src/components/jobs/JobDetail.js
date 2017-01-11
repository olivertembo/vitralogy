import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import SweetAlert from "react-bootstrap-sweetalert"
import Icon from "react-fa/lib/Icon"

import Overview from "./Overview"
import DataPanels from "./DataPanels"
import * as api from "../../constants/api"
import { selectResource, clearResourceItems } from "../../actions/resources"
import { selectJob } from "../../actions/jobs"

const propTypes = {
  auth: PropTypes.object,
  params: PropTypes.object,
}

const defaultProps = {
  auth: {},
  params: {},
}

const getState = state => {
  return {
    _resource: { ...state.resources },
  }
}

const getActions = dispatch => {
  return {
    selectResource: resource => dispatch(selectResource(resource)),
    selectJob: data => dispatch(selectJob(data)),
    clearResourceItems: () => dispatch(clearResourceItems()),
  }
}

class JobDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      alert: null,
      data: {
        JobId: 0,
        IsComplete: false,
        IsCancelled: false,
        IsFinalized: false,
        Resources: [],
        WorkScope: "",
        JobSerial: null,
      },
      jobReports: [],
      stepDocumentTypes: [],
      resourceGroup: {
        isLoadingResourceGroup: true,
        errorLoadingResourceGroup: false,
        assets: [],
        passLabel: "Pass",
        failLabel: "Fail",
      },
      showOverview: true,
      flags: {
        IsCheckinRequired: false,
        IsDataCollectionRequired: false,
        IsCheckList: false,
        IsCorrectiveAction: false,
        IsPrereq: false,
        IsActive: false,
        IsLive: false,
        IsBackEnd: false,
        IsActivityStarted: false,
        IsResourceSpecific: false,
        IsResourceGroupEnabled: false,
        IsAnyForm: false
      },
    }

    this.RefreshJobDataCallback = this.RefreshJobDataCallback.bind(this);    
  }

  componentDidMount() {
    this.props.selectResource(null)
    this.getData()

    if (window.innerWidth < 992) {
      this.setState({ showOverview: false })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps._resource.items.length > 0) {
      const data = Object.assign({}, this.state.data, {
        Resources: nextProps._resource.items,
      })

      this.setState({ data })
    }
  }

  componentWillUnmount() {
    this.props.selectJob(null)
    this.props.selectResource(null)
    this.props.clearResourceItems()
  }

  onFailedResourceClick = resourceId => {
    if (
      this.props._resource.selected === null ||
      this.props._resource.selected.value.JobResourceId !== resourceId
    ) {
      const findResource = this.state.data.Resources.filter(
        item => item.JobResourceId === resourceId,
      )[0]

      const resourceItem = { value: findResource, label: findResource.Name }

      this.props.selectResource(resourceItem)
    }
  }

  updateSignOff = data => {
    console.log("success data = ", data)
    const currentData = { ...this.state.data, ...data }
    console.log("merged data = ", currentData)
    this.setState({ data: currentData })
  }

  toggleOverview = () => {
    this.setState({ showOverview: !this.state.showOverview })
  }

  hideAlert = () => {
    this.setState({
      isLoading: false,
      alert: null,
    })
    this.props.history.replace("/jobs")
  }

  getJobReportData = () => {
    const jobId = Number(this.props.match.params.jobId)
    const url = `${api.JOB_ROOT}${jobId}${api.JOB_REPORTS_ENDPOINT}`

    return new Promise((resolve, reject) => {
      this.props.auth.request("get", url).then(
        response => {
          resolve(response)
        },
        failure => {
          reject(failure)
        },
      )
    })
  }

  getStepDocumentTypes = stepId => {
    const url = `${api.COMMON_ACTIVITY_STEP_DOCUMENT_TYPES}`
    return new Promise((resolve, reject) => {
      this.props.auth
        .request("get", url)
        .query({ docClassEnumId: api.DOC_CLASS_JOB_TIER_DOCUMENT })
        .query({ activityStepId: stepId })
        .then(
          response => {
            resolve(response)
          },
          failure => {
            reject(failure)
          },
        )
    })
  }

  getJobData = () => {
    const jobId = Number(this.props.match.params.jobId)
    const url = `${api.JOB_ROOT}${jobId}`

    return new Promise((resolve, reject) => {
      this.props.auth.request("get", url).then(
        response => {
          resolve(response)
        },
        failure => {
          reject(failure)
        },
      )
    })
  }

  getJobResourceGroup = () => {
    const jobId = Number(this.props.match.params.jobId)
    const url = `${api.JOB_RESOURCE_GROUP}`
    return new Promise((resolve, reject) => {
      this.props.auth
        .request("get", url)
        .query({ jobId })
        .then(
          response => {
            resolve(response)
          },
          failure => {
            reject(failure)
          },
        )
    })
  }

  async RefreshJobDataCallback() {
    this.setState({ isLoading: true })

    const [jobRes] = await Promise.all([
      this.getJobData()
    ])

    if (jobRes.ok && jobRes.body.IsSuccess) {
      const jobData = jobRes.body.JobDetails

      this.setState({
        data: jobData,
        flags: {
          IsCheckinRequired: jobData.IsCheckinRequired,
          IsDataCollectionRequired: jobData.IsDataCollectionRequired,
          IsCheckList: jobData.IsCheckList,
          IsCorrectiveAction: jobData.IsCorrectiveAction,
          IsPrereq: jobData.IsPrereq,
          IsActive: jobData.IsActive,
          IsLive: jobData.IsLive,
          IsActivityStarted: jobData.IsActivityStarted,
          IsBackEnd: jobData.IsActivityStarted,
          IsResourceSpecific: jobData.IsResourceSpecific,
          IsResourceGroupEnabled: jobData.IsResourceGroupEnabled,
          IsAnyForm: jobData.IsAnyForm
        }
      })

      this.props.selectJob(jobData)
    }


    this.setState({ isLoading: false })    

  }

  async getData() {
    this.setState({ isLoading: true })

    const [jobRes, jobReportData] = await Promise.all([
      this.getJobData(),
      this.getJobReportData(),
    ])

    if (jobRes.ok && jobRes.body.IsSuccess) {
      const jobData = jobRes.body.JobDetails

      this.setState({
        data: jobData,
        flags: {
          IsCheckinRequired: jobData.IsCheckinRequired,
          IsDataCollectionRequired: jobData.IsDataCollectionRequired,
          IsCheckList: jobData.IsCheckList,
          IsCorrectiveAction: jobData.IsCorrectiveAction,
          IsPrereq: jobData.IsPrereq,
          IsActive: jobData.IsActive,
          IsLive: jobData.IsLive,
          IsActivityStarted: jobData.IsActivityStarted,
          IsBackEnd: jobData.IsActivityStarted,
          IsResourceSpecific: jobData.IsResourceSpecific,
          IsResourceGroupEnabled: jobData.IsResourceGroupEnabled,
          IsAnyForm: jobData.IsAnyForm
        },
        jobReports: jobReportData.body.Reports,
      })

      const  stepDocTypes = await this.getStepDocumentTypes(
        jobData.ActivityStepId,
      )
      if (stepDocTypes.ok) {
        this.setState({ stepDocumentTypes: stepDocTypes.body })
      }

      this.props.selectJob(jobData)
      this.props.selectResource(null)

      // Set up custom resource info to reuse component
      // expecting resource data passed in
      if (
        jobData.ResourceSupportModeId ===
          api.RESOURCE_SUPPORT_MODE.NO_RESOURCE ||
        jobData.ResourceSupportModeId === api.RESOURCE_SUPPORT_MODE.CONTAINER
      ) {
        const siteBasedResource = {
          Name: "Site",
          tierId: this.state.data.ActiveTierId,
          JobResourceId: null,
        }

        this.props.selectResource({
          label: "Site",
          value: siteBasedResource,
        })
      }

      if (jobData.IsResourceGroupEnabled) {
        this.setState({
          isLoadingResourceGroup: true,
        })

        const jobResourceGroup = await this.getJobResourceGroup()
        if (jobResourceGroup.ok) {
          const resourceGroup = Object.assign({}, this.state.resourceGroup, {
            errorLoadingResourceGroup: jobResourceGroup.body.IsSuccess,
            assets: jobResourceGroup.body.Items,
            passLabel: jobResourceGroup.body.PassLabel,
            failLabel: jobResourceGroup.body.FailLabel,
            isLoadingResourceGroup: false,
          })

          this.setState({ resourceGroup })
        } else {
          const resourceGroup = Object.assign({}, this.state.resourceGroup, {
            errorLoadingResourceGroup: true,
            isLoadingResourceGroup: false,
            assets: [],
          })
          this.setState({ resourceGroup })
        }
      }

      this.setState({ isLoading: false })
    } else {
      this.setState({
        alert: (
          <SweetAlert
            title={`Job Details Failure!`}
            error
            onConfirm={this.hideAlert}
            timeout={5}
          >
            {jobRes.body.Msg}
          </SweetAlert>
        ),
      })
    }
  }

  render() {
    const {
      IsComplete,
      IsCancelled,
      IsAllowPostCloseChanges,
      IsPostCloseChangesCompleted,
    } = this.state.data
    const { IsLive } = this.state.flags

    let lockedReason = ""
    if (IsComplete) {
      lockedReason = `completed`
      if (IsAllowPostCloseChanges) {
        lockedReason = `${lockedReason} ${
          IsPostCloseChangesCompleted
            ? " (via post close)"
            : " (pending data entry)"
        }`
      }
    } else if (IsCancelled) {
      lockedReason = "canceled"
    } else if (IsLive === false) {
      lockedReason = "upcoming"
    }
    const tooltip = (
      <div>
        Function locked. Job is <strong>{lockedReason}</strong>.
      </div>
    )

    const props = {
      jobId: this.state.data.JobId,
      auth: this.props.auth,
      tierId: this.state.data.ActiveTierId,
      data: this.state.data,
      flags: this.state.flags,
      isLocked: IsComplete || IsCancelled || IsLive === false,
      lockedReason: tooltip,
      jobReports: this.state.jobReports,
      stepDocumentTypes: this.state.stepDocumentTypes,
    }

    if (this.state.isLoading) {
      return (
        <div className="job-detail">
          {this.state.alert}
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading job details...
          </div>
        </div>
      )
    }

    return (
      <div
        className={`job-detail job-detail--with-sidebar${
          this.state.showOverview ? " toggled" : ""
        }`}
      >
        {this.state.alert}

        <Overview
          {...props}
          toggleOverview={this.toggleOverview}
          onResourceClick={this.onFailedResourceClick}
          onJobDataChangeCallback={this.RefreshJobDataCallback}
        />

        <DataPanels
          {...props}
          resourceGroupData={this.state.resourceGroup}
          updateSignOff={this.updateSignOff}
        />
      </div>
    )
  }
}

JobDetail.propTypes = propTypes
JobDetail.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(JobDetail)
