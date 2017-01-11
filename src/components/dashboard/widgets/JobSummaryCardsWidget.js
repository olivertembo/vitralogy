import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import Tooltip from "antd/lib/tooltip"
import moment from "moment"
import Col from "react-bootstrap/lib/Col"
import Statistic from "antd/lib/statistic"
import List from "antd/lib/list"
import Card from "antd/lib/card"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"

const propTypes = {
  config: PropTypes.object.isRequired,
}

const defaultProps = {
  config: {},
}

export default class JobSummaryCardsWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: {
        TotalCount: 0,
        Jobs: [],
      },
    }
  }

  componentDidMount() {
    this.getData()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.getData(nextProps.config)
    }
  }

  getData = config => {
    if (config === undefined) {
      config = this.props.config
    }

    if (
      this.state.isFetching ||
      config === null ||
      config.activeNode.activeSite === undefined
    ) {
      return
    }

    this.setState({ isFetching: true })

    let dtStart = moment(config.startDate).format("MM/DD/YYYY"),
      dtEnd = moment(config.endDate).format("MM/DD/YYYY")

    const url = `${api.JOB_SUMMARY_DASHBOARD_WIDGET}`

    config.auth
      .request("get", url)
      .query({ accountSiteId: config.activeNode.activeSite.value })
      .query({ beginDate: dtStart })
      .query({ endDate: dtEnd })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ data: response.body })
          } else {
            console.log("failed to get open job stats")
          }
        },
        () => {
          console.log("failed to get open job stats")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const { data, isFetching } = this.state
    const { Jobs, TotalCount } = data

    if (isFetching || TotalCount === 0) {
      return (
        <Col md={12}>
          <Alert bsStyle="info">
            <Icon spin name="spinner" /> Fetching data...
          </Alert>
        </Col>
      )
    }

    const summary = Jobs[0]
    const config = this.props.config

    const schedDate = `${moment(config.startDate).format(
      "MM/DD/YYYY",
    )} and ${moment(config.endDate).format("MM/DD/YYYY")}`
    const locationName = `${
      config.activeNode.activeSite === undefined
        ? ""
        : config.activeNode.activeSite.label
    }`

    const cards = [
      {
        id: 0,
        title: "Active",
        icon: "briefcase",
        color: "green",
        toolTip: `Jobs that are open and in progress for ${locationName} between ${schedDate}.`,
        value: summary.ActiveJobsCount,
      },
      {
        id: 1,
        title: "Upcoming",
        icon: "calendar",
        color: "#f0ad4e",
        toolTip: `Jobs that are not yet started for ${locationName} between ${schedDate}.`,
        value: summary.UpcomingJobsCount,
      },
      {
        id: 2,
        title: "Corrective Actions",
        icon: "wrench",
        color: "silver",
        toolTip: `Corrective action assignments for ${locationName} between ${schedDate}.`,
        value: summary.CorrectiveActionJobsCount,
      },
      {
        id: 3,
        title: "Support",
        icon: "medkit",
        color: "red",
        toolTip: `Support jobs for ${locationName} received between ${schedDate}.`,
        value: summary.SupportJobsCount,
      },
      {
        id: 4,
        title: "Completed",
        icon: "check",
        color: "black",
        toolTip: `Jobs that are finished for ${locationName} between ${schedDate}.`,
        value: summary.CompletedJobsCount,
      },
      {
        id: 5,
        title: "Canceled",
        icon: "ban",
        color: "orange",
        toolTip: `Jobs that have been rescinded for ${locationName} between ${schedDate}.`,
        value: summary.CancelledJobsCount,
      },
    ]

    if (TotalCount === 0 || Jobs.length === 0) {
      const msg = <div>No job summary for specified interval.</div>
      return (
        <Col md={12}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No job summary available!`}
            message={msg}
          />
          <br />
        </Col>
      )
    }

    return (
      <Col md={12}>
        <List
          grid={{ gutter: 8, column: 6 }}
          itemLayout="horizontal"
          pagination={false}
          dataSource={cards}
          renderItem={c => (
            <List.Item key={c.id}>
              <Tooltip
                placement="right"
                title={c.toolTip}
                mouseEnterDelay={0.5}
              >
                <Card>
                  <Statistic
                    title={c.title}
                    value={c.value}
                    prefix={
                      <Icon
                        name={c.icon}
                        size="2x"
                        style={{ color: c.color }}
                      />
                    }
                  />
                </Card>
              </Tooltip>
            </List.Item>
          )}
        />
      </Col>
    )
  }
}

JobSummaryCardsWidget.propTypes = propTypes
JobSummaryCardsWidget.defaultProps = defaultProps
