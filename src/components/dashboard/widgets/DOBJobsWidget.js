import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import Label from "react-bootstrap/lib/Label"
import { Link } from "react-router-dom"
import Tooltip from "antd/lib/tooltip"
import List from "antd/lib/list"
import Card from "antd/lib/card"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"
import MomentFormatter from "../../MomentFormatter"
import JobFriendlyName from "../../jobs/JobFriendlyName"

const propTypes = {
  config: PropTypes.object.isRequired,
  autoHeightMax: PropTypes.number,
  widgetType: PropTypes.number.isRequired,
}

const defaultProps = {
  config: {},
  autoHeightMax: 300,
  widgetType: api.DOB_WIDGET_TYPE.YEAR,
}

export default class DOBJobsWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: [],
    }
  }

  componentDidMount() {
    this.getData()
  }

  componentWillReceiveProps(nextProps) {
      if (this.props.config !== nextProps.config || 
          this.props.widgetType !== nextProps.widgetType) {
          this.getData(nextProps.config, nextProps.widgetType)
    }
  }

    getData = (config, widgetType) => {
    if (config === undefined) {
      config = this.props.config
    }
        if (widgetType === undefined) {
            widgetType = this.props.widgetType
        }

    if (
      this.state.isFetching ||
      config === null ||
      config.activeNode.activeSite === undefined
    ) {
      return
    }

    this.setState({ isFetching: true })

    let url = api.CRITICAL_DATES_DOB_YEAR_DASHBOARD_WIDGET(
      config.activeNode.activeSite.value,
    )
    switch (widgetType) {
      case api.DOB_WIDGET_TYPE.YEAR:
        url = api.CRITICAL_DATES_DOB_YEAR_DASHBOARD_WIDGET(
          config.activeNode.activeSite.value,
        )
        break
      case api.DOB_WIDGET_TYPE.MONTH:
        url = api.CRITICAL_DATES_DOB_MONTH_DASHBOARD_WIDGET(
          config.activeNode.activeSite.value,
        )
        break
      case api.DOB_WIDGET_TYPE.LATE:
        url = api.CRITICAL_DATES_DOB_LATE_DASHBOARD_WIDGET(
          config.activeNode.activeSite.value,
        )
        break
      default:
        url = api.CRITICAL_DATES_DOB_YEAR_DASHBOARD_WIDGET(
          config.activeNode.activeSite.value,
        )
        break
    }

    config.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ data: response.body.CriticalDatesDobWidget })
          } else {
            console.log("failed to get open corrective action job stats")
          }
        },
        () => {
          console.log("failed to get open corrective action job stats")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  statusFormatter = job => {
    var style = "info"
    var status = "New"
    var formatter = <p />
      switch (Number(job.StatusId)) {
      case api.STATUS_ITEM.IN_PROGRESS:
        style = "success"
        status = "In Progress"
        break
      case api.STATUS_ITEM.ON_HOLD:
        style = "warning"
        status = "On Hold"
        break
      case api.STATUS_ITEM.COMPLETED:
        style = "primary"
        status = "Completed"
        break
      case api.STATUS_ITEM.CANCELED:
        style = "danger"
        status = "Canceled"
        break
      case api.STATUS_ITEM.NEW:
      default:
        style = "info"
        status = "New"
        break
    }

    formatter = (
      <Label bsStyle={style}>
       {status}
      </Label>
    )
    return formatter
  }

  lateFormatter = job => {
    const formatter = (
        <Label bsStyle={job.IsLate ? "danger" : "info"}>
            {`${job.IsLate ? "Yes" : "No"}`}
      </Label>
    )

    return formatter
  }

  render() {
    const className = "critical-dates-dob-widget"
    const options = {
      hideSizePerPage: true,
      noDataText: "No data available",
    }
    const scrollStyle = {
      width: "100%",
      }
      const { isFetching, data } = this.state

    if (isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching data...
        </Alert>
      )
    }

    if (data.length === 0) {
      const msg = <div>No critical dates pending for site.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No Critical Dates Pending!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <div className={className}>
            <List
                grid={{ gutter: 9, column: 3 }}
                itemLayout="horizontal"
                pagination={{
                    pageSize: 12,
                    hideOnSinglePage: true,
                    simple: true,
                }}
                header={<span className="critical-item-value">Jobs</span>}                
                dataSource={data}
                renderItem={item => (
                    <List.Item key={item.JobId}>
                        <Card>
                            <Card.Meta                                
                                description={
                                    <ul className="critical-item">
                                        <li>
                                            <span className="critical-item-value">
                                                <Tooltip
                                                    placement="right"
                                                    title={`Click to view job # ${item.JobNumber}`}
                                                    mouseEnterDelay={0.5}
                                                >
                                                    <Link
                                                        to={`/jobs/${item.JobId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span>{item.JobNumber}</span>
                                                    </Link>
                                                </Tooltip>
                                                <br />
                                                {this.statusFormatter(item)}
                                            </span>
                                            <br />
                                            <span className="critical-item-header">{`Status`}</span>
                                        </li>
                                        <li>
                                            <span className="critical-item-value">
                                                {`${item.JobName}`}
                                            </span>
                                            <br />
                                            <span className="critical-item-header">{`Type`}</span>
                                        </li>
                                        <li>
                                            <span className="critical-item-value">
                                                {`${item.VendorName || "N/A"}`}
                                            </span>
                                            <br />
                                            <span className="critical-item-header">{`Service Provider`}</span>
                                        </li>
                                        <li>
                                            <span className="critical-item-value">
                                                <MomentFormatter datetime={item.ScheduledDate} formatter="MM/DD/YYYY" />
                                            </span>
                                            <br />
                                            <span className="critical-item-header">{`Schedule Date`}</span>
                                        </li>
                                        <li>
                                            <span className="critical-item-value">
                                                {this.lateFormatter(item)}
                                            </span>
                                            <br />
                                            <span className="critical-item-header">{`Late`}</span>
                                        </li>
                                    </ul>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
      </div>
    )
  }
}

DOBJobsWidget.propTypes = propTypes
DOBJobsWidget.defaultProps = defaultProps
