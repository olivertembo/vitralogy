import React from "react"
import PropTypes from "prop-types"
import Alert from "react-bootstrap/lib/Alert"
import { Icon } from "react-fa"
import { Glyphicon, Tooltip, OverlayTrigger } from "react-bootstrap"

import * as api from "../constants/api"
import EmptyStateContainer from "./EmptyStateContainer"
import CheckList from "../components/jobs/CheckList"
import uniqueId from "../utils/UniqueIdHelper"
import { format } from "../utils/datetime"

const propTypes = {
  auth: PropTypes.object.isRequired,
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number,
  getType: PropTypes.string.isRequired,
}

const defaultProps = {
  isPrerequisiteList: true,
  jobResourceId: null,
  auth: {},
  getType: api.CheckListTypeEnum.PREREQUISITE_ONLY,
  items: [],
  uniqueInputPrefix: "",
}

export default class CheckListContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      isFetching: false,
    }
  }

  componentDidMount() {
    // Handle first resource loaded
    this.getItems()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.jobResourceId !== nextProps.jobResourceId) {
      this.getItems(nextProps.jobResourceId)
    }
  }

  getItems(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    const url = `${api.JOBS_ROOT}${this.props.jobId}/${
      api.JOB_CHECKLIST_ENDPOINT
    }`

    if (jobResourceId === undefined) {
      jobResourceId = this.props.jobResourceId
    }

    this.props.auth
      .request("get", url)
      .query({ jobId: this.props.jobId })
      .query({ jobSourcingTierId: this.props.tierId })
      .query({ getType: this.props.getType })
      .query({ jobResourceId: jobResourceId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            if (response.body.Items.length > 0) {
              if (
                this.props.getType === api.CheckListTypeEnum.PREREQUISITE_ONLY
              ) {
                const {
                  PrerequisiteItems,
                  IsPrerequisiteIAgree,
                  CreatedBy,
                  CreatedOn,
                  SiteTimeZoneShortName,
                  IsCreatedByMobile,
                } = response.body.Items[0]
                const agreeValue =
                  IsPrerequisiteIAgree === null ? false : IsPrerequisiteIAgree

                const mobileToolTip = (
                  <Tooltip id="uploadViaToolTip">
                    {IsCreatedByMobile
                      ? "Uploaded via mobile"
                      : "Uploaded via web"}
                  </Tooltip>
                )

                const uploadType = (
                  <OverlayTrigger placement="left" overlay={mobileToolTip}>
                    <Glyphicon
                      glyph={IsCreatedByMobile ? "phone" : "blackboard"}
                    />
                  </OverlayTrigger>
                )

                const numChecked = PrerequisiteItems.filter(
                  item => item.IsSelected === true,
                ).length
                const Name = `${CreatedBy} reviewed the checklist items above and selected ${numChecked} out of ${
                  PrerequisiteItems.length
                } on ${format(
                  CreatedOn,
                  "l LT",
                )} ${SiteTimeZoneShortName} which are applicable.`
                const agreeItem = {
                  CheckListId: 0,
                  IsSelected: agreeValue,
                  IsPrereq: true,
                  Name,
                  Description: "",
                  IsRequired: true,
                  UploadType: uploadType,
                }

                this.setState({
                  items: [...PrerequisiteItems, agreeItem],
                  uniqueInputPrefix: uniqueId("job-prereq-checklist-"),
                })
              } else {
                const {
                  JobCheckListItems,
                  IsJobCheckListIAgree,
                  CreatedBy,
                  CreatedOn,
                  SiteTimeZoneShortName,
                  IsCreatedByMobile,
                } = response.body.Items[0]

                const mobileToolTip = (
                  <Tooltip id="uploadViaToolTip">
                    {IsCreatedByMobile
                      ? "Uploaded via mobile"
                      : "Uploaded via web"}
                  </Tooltip>
                )

                const uploadType = (
                  <OverlayTrigger placement="left" overlay={mobileToolTip}>
                    <Glyphicon
                      glyph={IsCreatedByMobile ? "phone" : "blackboard"}
                    />
                  </OverlayTrigger>
                )

                const numChecked = JobCheckListItems.filter(
                  item => item.IsSelected === true,
                ).length
                const Name = `${CreatedBy} reviewed the checklist items above and selected ${numChecked} out of ${
                  JobCheckListItems.length
                } on ${format(
                  CreatedOn,
                  "l LT",
                )} ${SiteTimeZoneShortName} which are applicable.`
                const agreeItem = {
                  CheckListId: 0,
                  IsSelected: IsJobCheckListIAgree,
                  IsPrereq: false,
                  Name,
                  Description: "",
                  IsRequired: false,
                  UploadType: uploadType,
                }

                const items = [...JobCheckListItems, agreeItem]
                this.setState({
                  items,
                  uniqueInputPrefix: uniqueId("job-checklist-"),
                })
              }
            } else {
              this.setState({
                items: [],
              })
            }
          } else {
            console.log(`error retrieving ${this.props.getType} items`)
          }
        },
        () => {
          console.log(`error retrieving ${this.props.getType} items`)
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "check-list-container"
    let checkListType =
      this.props.getType === api.CheckListTypeEnum.PREREQUISITE_ONLY
        ? "prerequisite"
        : "job"

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />{" "}
          {`Fetching ${checkListType} checklist...`}
        </Alert>
      )
    }

    if (this.state.items === undefined || this.state.items.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No ${checkListType} checklist!`}
            message={`No ${checkListType} checklist submitted by the subcontractor`}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <CheckList
          items={this.state.items}
          hideDescription={false}
          uniqueInputPrefix={this.state.uniqueInputPrefix}
        />
      </div>
    )
  }
}

CheckListContainer.propTypes = propTypes
CheckListContainer.defaultProps = defaultProps
