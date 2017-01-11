import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"
import Panel from "react-bootstrap/lib/Panel"
import ListGroup from "react-bootstrap/lib/ListGroup"
import ListGroupItem from "react-bootstrap/lib/ListGroupItem"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import Alert from "react-bootstrap/lib/Alert"
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView"
import { Scrollbars } from "react-custom-scrollbars"
import Label from "react-bootstrap/lib/Label"

import ToastHelper from "../../utils/ToastHelper"
import CommentTable from "./CommentTable"
import JobFriendlyName from "./JobFriendlyName"
import OverlayButton from "../layout/OverlayButton"
import EditEtaDate from "./edit/EditEtaDate"
import * as api from "../../constants/api"
import { toggleJobActivityStarted } from "../../actions/jobs"
import { format } from "../../utils/datetime"

import { ReactComponent as SiteIcon } from "../../assets/icons/brand/site.svg"
import { ReactComponent as StatusIcon } from "../../assets/icons/brand/status.svg"
import { ReactComponent as DetailsIcon } from "../../assets/icons/brand/details.svg"
import { ReactComponent as ScopeIcon } from "../../assets/icons/brand/scope.svg"
import { ReactComponent as CommentIcon } from "../../assets/icons/brand/comments.svg"
import { ReactComponent as PushMenu } from "../../assets/icons/brand/push-menu.svg"

const propTypes = {
  data: PropTypes.object,
  auth: PropTypes.object,
  toggleOverview: PropTypes.func.isRequired,
  flags: PropTypes.object,
  onResourceClick: PropTypes.func.isRequired,
  stepDocumentTypes: PropTypes.array.isRequired,
}

const defaultProps = {
  data: {},
  auth: {},
  flags: {},
}

const getState = state => {
  return {
    _userAccount: { ...state.userAccounts.selectedUserAccount },
    _jobs: { ...state.jobs },
    _selected: { ...state.jobs.selected },
  }
}

const getActions = dispatch => {
  return {
    toggleJobActivityStarted: bool => dispatch(toggleJobActivityStarted(bool)),
  }
}

const SIDEBAR_SECTIONS = {
  SITE: 'site',
  STATUS: 'status',
  DETAILS: 'details',
  SCOPE: 'scope',
  COMMENTS: 'commnts'
}

class Overview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      showEditEtaWindow: false,
      sidebarSections: {
        [SIDEBAR_SECTIONS.SITE]: true,
        [SIDEBAR_SECTIONS.STATUS]: true,
        [SIDEBAR_SECTIONS.DETAILS]: true,
        [SIDEBAR_SECTIONS.SCOPE]: true,
        [SIDEBAR_SECTIONS.COMMENTS]: true,
      }
    }

    this.progressFormatter = this.progressFormatter.bind(this)
  }

  get displayName() {
    return "Overview"
  }

  progressFormatter(data) {
    var style = "warning"
    var formatter = <p />
    var lateToolTip = <p />
    switch (data.ActiveVendorProgressId) {
      case api.SourcingTierProgressEnum.SIGNED_OFF:
        style = "warning"
        lateToolTip = (
          <Tooltip id="signOffToolTip">{`Signed off on ${format(
            data.ActiveVendorFinalizedDate,
            "l LT",
          )} ${data.SiteTimeZoneShortName} by ${
            data.ActiveVendorFinalizedBy
          }`}</Tooltip>
        )
        break
    }

    formatter =
      data.ActiveVendorProgressId ===
      api.SourcingTierProgressEnum.SIGNED_OFF ? (
        <OverlayTrigger overlay={lateToolTip} placement="top">
          <Label bsStyle={style} className="short">
            &nbsp;{data.ActiveVendorVendorProgress}{" "}
          </Label>
        </OverlayTrigger>
      ) : (
        <Label bsStyle={style} className="short">
          &nbsp;{data.ActiveVendorVendorProgress}{" "}
        </Label>
      )
    return formatter
  }

  toggleEditEtaDate = () => {
    this.setState({ showEditEtaWindow: !this.state.showEditEtaWindow })
  }

  onDateSubmit = response => {
    //console.log('onDateSubmit: ' + JSON.stringify(response))
    // const { selectedTierDetails } = this.props._jobDetails

    if(response.opResult === true)
    {
      (async () => {
        await this.props.onJobDataChangeCallback();
      })();      

      ToastHelper.success(response.message)
    }
    else
      ToastHelper.error(response.message)
    // if (
    //   selectedTierDetails.TransitionStateId === api.TierTransitionStateEnum.ACTIVE &&
    //   selectedTierDetails.VendorId
    // ) {
    //   console.log("updating active tier, for schedule date changes too...")
    //   this.props.getTierDetails(this.props.jobId, selectedTierDetails.Id)
    // }
    // this.props.getJobDetails(this.props.jobId, true)
  }

  handleSectionCollapse = section => e => {
    const { sidebarSections } = this.state
    this.setState({
      sidebarSections: {
        ...sidebarSections,
        [section]: !sidebarSections[section]
      }
    })
  }


  render() {
    const placeholder = <span className="placeholder">N/A</span>
    const props = {
      jobId: this.props.jobId,
      auth: this.props.auth,
      tierId: this.props.data.ActiveTierId,
      isLocked: this.props.isLocked,
      lockedReason: this.props.lockedReason,
      rowversion: this.props.data.RowVersion,
    }

    const { sidebarSections } = this.state

    const etaToolTip = props.isLocked ? (
      props.lockedReason
    ) : this.props.data.IsActivityStarted ? (
      <div>
        Function locked. Work Order <strong>started.</strong>.
      </div>
    ) : (
      "Click to update eta date"
    )
    const etaLock = this.props.isLocked || this.props.data.IsActivityStarted

    let formattedScheduleDate = placeholder
    if (
      this.props.data.ActiveVendorScheduledDate !== undefined &&
      this.props.data.ActiveVendorScheduledDate !== null
    ) {
      formattedScheduleDate = `${format(
        this.props.data.ActiveVendorScheduledDate,
        "l LT",
      )} ${this.props.data.SiteTimeZoneShortName}`
    }

    let activeVendor = placeholder
    if (
      this.props.data.ActiveVendor !== undefined &&
      this.props.data.ActiveVendor != null
    ) {
      activeVendor = this.props.data.ActiveVendor
    }

    let formattedEtaDate = placeholder

    if (
      this.props.data.CustomerEtaDate !== undefined &&
      this.props.data.CustomerEtaDate != null
    ) {
      formattedEtaDate = `${format(this.props.data.CustomerEtaDate, "l LT")} ${
        this.props.data.SiteTimeZoneShortName
      }`
    }

    let formattedProgress = this.progressFormatter(this.props.data)

    let formattedPO = placeholder
    if (
      this.props.data.CustomerPO !== undefined &&
      this.props.data.CustomerPO != null
    ) {
      formattedPO = this.props.data.CustomerPO
    }

    let creationDate = placeholder
    if (
      this.props.data.CreatedOn !== undefined &&
      this.props.data.CreatedOn !== null
    ) {
      creationDate = `${format(this.props.data.CreatedOn, "l LT")}`
    }

    let receivedOn = placeholder
    if (
      this.props.data.RecievedOn !== undefined &&
      this.props.data.RecievedOn !== null
    ) {
      receivedOn = `${format(this.props.data.RecievedOn, "l LT")}`
    }

    const mapsLink = `http://maps.google.com/?q=${this.props.data.Site}`
    const addrToolTip = (
      <Tooltip id="addrToolTip">{`Click to view ${
        this.props.data.Site
      } on Google maps`}</Tooltip>
    )

    const scrollStyle = {
      width: "100%",
    }


    return (
      <div className="job-detail__sidebar">
        <PushMenu
          onClick={this.props.toggleOverview}
          className="toggle-icon" />
        <section className="section-title">
          <div className="container-fluid">
            <h1>Job Details</h1>
            {this.props.flags.IsLive === false && (
              <Alert bsStyle="warning">
                <Icon name="exclamation-circle" />{" "}
                <strong>Upcoming Job:</strong> Unable to change any details to
                this job until it goes live.
              </Alert>
            )}
          </div>
        </section>
        <section className="job-overview">
          <div className="container-fluid">
            <div className="row customer">
              <div className="section-header">
                <h4
                  className={!sidebarSections[SIDEBAR_SECTIONS.SITE] && 'collapsed'}
                  onClick={this.handleSectionCollapse(SIDEBAR_SECTIONS.SITE)}>
                  <span><SiteIcon className="icon" /> Site</span>
                </h4>
              </div>
              <div className={`overview-padding ${!sidebarSections[SIDEBAR_SECTIONS.SITE] && 'collapsed'}`}>
                <ListGroup>
                  <ListGroupItem>
                    <ul className="list-unstyled overview-details">
                      <li>
                        <strong>{this.props.data.SiteName}</strong> <br/>
                        <span>Name</span>
                      </li>
                      <li>
                        <strong>
                          <OverlayTrigger overlay={addrToolTip} placement="top">
                            <a
                              href={mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {this.props.data.Site}
                            </a>
                          </OverlayTrigger>
                        </strong><br/>
                        <span>Address</span>
                      </li>
                      <li>
                        <strong>{this.props.data.ProjectNumber}</strong><br/>
                        <span>Project</span>
                      </li>
                      <li>
                        <strong>
                            {formattedEtaDate}{" "}
                          <OverlayButton
                            bsClass="btn-inline"
                            bsSize="xsmall"
                            bsStyle="link"
                            glyph="pencil"
                            disabled={etaLock}
                            text={etaToolTip}
                            onClick={this.toggleEditEtaDate}
                          />
                          {this.state.showEditEtaWindow && (
                            <EditEtaDate
                            {...props}
                            show={this.state.showEditEtaWindow}
                            onHide={this.toggleEditEtaDate}
                            onDateSubmit={this.onDateSubmit}
                            initialDate={this.props.data.CustomerEtaDate}
                            timezone={this.props.data.SiteTimeZoneShortName}
                          />
                          )}
                        </strong><br/>
                        <span>ETA Date/Time</span>
                      </li>
                      <li>
                        <strong>{activeVendor}</strong><br/>
                        <span>Active Subcontractor</span>
                      </li>
                      <li>
                        <strong>{formattedScheduleDate}</strong> <br/>
                        <span>Scheduled Service Date</span>

                      </li>
                      <li>
                        <p><strong>{formattedProgress}</strong></p>
                        <span><i>Progress</i></span>
                      </li>
                      {/* placeholder first check in */
                      this.props.flags.IsCheckinRequired &&
                        this.props.data.ActiveVendorFirstCheckedInOnDateTime ===
                          null && (
                          <li>
                            <strong>{placeholder}</strong> <br/>
                            <span>First Check In</span>
                          </li>
                        )}
                      {/* actual value for first check in */
                      this.props.flags.IsCheckinRequired &&
                        this.props.data.ActiveVendorFirstCheckedInOnDateTime !==
                          null && (
                          <li>
                            <strong>{this.props.data.ActiveVendorFirstCheckedInFor} @{" "}
                            {format(
                              this.props.data
                                .ActiveVendorFirstCheckedInOnDateTime,
                              "l LT",
                            )}{" "}
                            {this.props.data.SiteTimeZoneShortName}</strong><br/>
                            <span>First Check In</span>
                          </li>
                        )}
                      {/* placeholder last check out */
                      this.props.flags.IsCheckinRequired &&
                        this.props.data.ActiveVendorLastCheckedOutOnDateTime ===
                          null && (
                          <li>
                            <strong>{placeholder}</strong><br/>
                            <span>Last Check Out</span>
                          </li>
                        )}
                      {/* actual value for last check out */
                      this.props.flags.IsCheckinRequired &&
                        this.props.data.ActiveVendorLastCheckedOutOnDateTime !==
                          null && (
                          <li>
                            <strong>
                              {this.props.data.ActiveVendorLastCheckedOutFor} @{" "}
                              {format(
                                this.props.data
                                  .ActiveVendorLastCheckedOutOnDateTime,
                                "l LT",
                              )}{" "}
                              {this.props.data.SiteTimeZoneShortName}
                            </strong><br/>
                            <span>Last Check Out</span>
                          </li>
                        )}
                    </ul>
                  </ListGroupItem>
                </ListGroup>
              </div>

            </div>

            <div className="row status">
              <div className="section-header">
                <h4
                  className={!sidebarSections[SIDEBAR_SECTIONS.STATUS] && 'collapsed'}
                  onClick={this.handleSectionCollapse(SIDEBAR_SECTIONS.STATUS)}>
                  <span><StatusIcon className="icon" /> Status</span>
                </h4>
              </div>
              <div className={`overview-padding ${!sidebarSections[SIDEBAR_SECTIONS.STATUS] && 'collapsed'}`}>
                <Panel>
                  <Panel.Body>
                    <div>
                      <Label
                        bsClass="label"
                        bsStyle={
                          this.props.data.StatusId === api.STATUS_ITEM.NEW
                            ? "warning"
                            : "default"
                        }>
                        Pending
                      </Label>
                      <Label
                        bsClass="label"
                        bsStyle={
                          this.props.data.StatusId === api.STATUS_ITEM.IN_PROGRESS
                            ? "warning"
                            : "default"
                        }>
                        In Progress
                      </Label>
                      <Label
                        bsClass="label"
                        bsStyle={
                          this.props.data.StatusId === api.STATUS_ITEM.ON_HOLD
                            ? "warning"
                            : "default"
                        }>
                        On Hold
                      </Label>
                    </div>
                    <div>
                      <Label
                        bsClass="label"
                        bsStyle={
                          this.props.data.StatusId === api.STATUS_ITEM.CANCELED
                            ? "warning"
                            : "default"
                        }>
                        Canceled
                      </Label>
                      <Label
                        bsClass="label"
                        bsStyle={
                          this.props.data.StatusId === api.STATUS_ITEM.COMPLETED
                            ? "warning"
                            : "default"
                        }>
                        Completed
                      </Label>
                    </div>
                  </Panel.Body>
                </Panel>
              </div>
            </div>

            <div className="row details">
              <div className="section-header">
                <h4
                  className={!sidebarSections[SIDEBAR_SECTIONS.DETAILS] && 'collapsed'}
                  onClick={this.handleSectionCollapse(SIDEBAR_SECTIONS.DETAILS)}>
                  <span><DetailsIcon className="icon" />Details</span>
                </h4>
              </div>
              <div className={`overview-padding ${!sidebarSections[SIDEBAR_SECTIONS.DETAILS] && 'collapsed'}`}>
                <Panel>
                  <Panel.Body>
                    <ul className="list-unstyled overview-details">
                      <li>
                        <strong className={
                            this.props.data.PriorityId ===
                            api.JOB_PRIORITY_ITEM.Emergency
                              ? "issue"
                              : "no-issue"
                          }>
                          {this.props.data.Priority}
                        </strong><br/>
                        <span>Priority</span>

                      </li>
                      {this.props.data.CriticalDateType && <li>
                        <strong>{this.props.data.CriticalDateType}</strong><br/>
                        <span>Category (Critical Date Category)</span>
                      </li>}
                      <li>
                        <strong>{this.props.data.ActivityModel}</strong><br/>
                        <span>Activity Model</span>
                      </li>
                      <li>
                        <strong>
                          <JobFriendlyName
                            name={this.props.data.AStep_Name}
                            shortName={this.props.data.AStep_ShortName}
                            siteShortName={this.props.data.ASiteAStep_ShortName}
                            description={this.props.data.AStep_Description}
                            siteDescription={this.props.data.ASiteAStep_Description}
                            placement="right"
                          />
                        </strong><br/>
                        <span>Activity Type</span>
                      </li>
                      <li>
                        <strong>{creationDate}</strong><br/>
                        <span>Created On</span>
                      </li>
                      <li>
                        <strong>{formattedPO}</strong><br/>
                        <span>Customer PO</span>
                      </li>
                      <li>
                        <strong>{this.props.data.RecievedMethod}</strong><br/>
                        <span>Received Method</span>
                      </li>
                      <li>
                        <strong>{receivedOn}</strong> <br/>
                        <span>Received On</span>
                      </li>
                    </ul>
                  </Panel.Body>
                </Panel>

              </div>
            </div>

            <div className="row scope">
              <div className="section-header">
                <h4
                  className={!sidebarSections[SIDEBAR_SECTIONS.SCOPE] && 'collapsed'}
                  onClick={this.handleSectionCollapse(SIDEBAR_SECTIONS.SCOPE)}>
                  <span><ScopeIcon className="icon" /> Work Scope</span>
                </h4>
              </div>
              <div className={`overview-padding ${!sidebarSections[SIDEBAR_SECTIONS.SCOPE] && 'collapsed'}`}>
                <Panel>
                  <Panel.Body>
                      <strong>
                        <Scrollbars
                          style={scrollStyle}
                          autoHeight
                          autoHeightMin={25}
                          autoHeightMax={200}
                        >
                          <FroalaEditorView
                            model={this.props.data.WorkScope}
                            readOnly
                          />
                        </Scrollbars>
                      </strong> <br/>
                      <span>Overview</span>

                  </Panel.Body>
                </Panel>
              </div>
            </div>

            {/* <div className="row photos">
              <div className="section-header">
                <h4>Photos</h4>
              </div>
              <div className="col-sm-12">
                <div className="overview-padding">
                  <PhotoContainer {...props} />
                </div>
              </div>
            </div>

            <div className="row documents">
              <div className="section-header">
                <h4>Customer Documents</h4>
              </div>
              <div className="col-sm-12">
                <div className="overview-padding">
                  <DocumentList
                    {...props}
                    stepDocumentTypes={this.props.stepDocumentTypes}
                  />
                </div>
              </div>
            </div>*/}

            <div className="row comments">
              <div className="section-header">
                <h4
                  className={!sidebarSections[SIDEBAR_SECTIONS.COMMENTS] && 'collapsed'}
                  onClick={this.handleSectionCollapse(SIDEBAR_SECTIONS.COMMENTS)}>
                  <span><CommentIcon className="icon" /> Comments</span>
                </h4>
              </div>
              <div className={`overview-padding ${!sidebarSections[SIDEBAR_SECTIONS.COMMENTS] && 'collapsed'}`}>
                <Panel>
                  <Panel.Body>
                    <CommentTable {...props} />
                  </Panel.Body>
                </Panel>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

Overview.propTypes = propTypes
Overview.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(Overview)
