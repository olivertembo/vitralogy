import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import Tooltip from "antd/lib/tooltip"
import Drawer from "antd/lib/drawer"
import Calendar from "antd/lib/calendar"
import Button from "react-bootstrap/lib/Button"
import Tag from "antd/lib/tag"
import Popover from "react-bootstrap/lib/Popover"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"

import ExpandedWidget from "./ExpandedWidget"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

const propTypes = {
  config: PropTypes.object.isRequired,
}

export default class DOBCalendar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showFullScreenDrawer: false,
      selectedWidget: null,
      isFetching: false,
      jobsInfo: [],
      assetsInfo: [],
      sitesInfo: [],
      currentDate: moment(),
      mode: "month",
      jobsTotalInfo: [],
    }
  }

  componentDidMount() {
    if (this.state.mode === "month") {
      this.getDOBMonthData()
    } else {
      this.getDOBYearData()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      if (this.state.mode === "month") {
        this.getDOBMonthData(nextProps.config)
      } else {
        this.getDOBYearData(nextProps.config)
      }
    }
  }

  getDOBMonthData = config => {
    const { currentDate } = this.state

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
    const url = api.CRITICAL_DATES_DASHBOARD(
      config.activeNode.value,
      currentDate.month() + 1,
      currentDate.year(),
    )

    config.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({
              jobsInfo: response.body.JobsInfo,
              assetInfo: response.body.AssetsInfo,
              sitesInfo: response.body.SitesInfo,
            })
          } else {
            console.log("failed to get crtical dates for month")
          }
        },
        () => {
          console.log("failed to get critical dates for month")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  getDOBYearData = config => {
    const { currentDate } = this.state

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
    const url = api.CRITICAL_DATES_DOB_YEAR_TOTAL_DASHBOARD(
      config.activeNode.value,
      currentDate.year(),
    )

    config.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({
              jobsTotalInfo: response.body.JobsTotalInfo,
            })
          } else {
            console.log("failed to get crtical dates year totals")
          }
        },
        () => {
          console.log("failed to get critical dates year totals")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  onPanelChange = (value, mode) => {
    //console.log(value, mode)
    this.setState(
      {
        currentDate: value,
        mode,
      },
      () => {
        mode === "month" ? this.getDOBMonthData() : this.getDOBYearData()
      },
    )
  }

  toggleFullScreen = (show, selectedWidget) => {
    this.setState({
      showFullScreenDrawer: show,
      selectedWidget,
    })
  }

  onSelect = selectedValue => {
    const { mode } = this.state
    //console.log(`Selected : ${selectedValue && selectedValue.format("YYYY-MM-DD")}`)
    if (mode === "year") {
      this.setState(
        {
          mode: "month",
          currentDate: selectedValue,
        },
        () => {
          this.getDOBMonthData()
        },
      )
    } else {
      this.setState({
        currentDate: selectedValue,
      })
    }
  }

  getEventData = value => {
    const { jobsInfo } = this.state
    let listData = jobsInfo.filter(j =>
      moment(j.ScheduledDate).isSame(value, "day"),
    )
    return listData
  }

  getAssetData = resourceId => {
    const { assetInfo } = this.state
    return assetInfo.find(a => a.ResourceId === resourceId)
  }

  dateCellRender = value => {
    const listData = this.getEventData(value)
    return (
      <ul className="events">
        {listData.map((event, index) => {
          const asset = this.getAssetData(event.ResourceId)
          const site = this.state.sitesInfo.find(
            s => s.AccountSiteId === event.AccountSiteId,
          )
          let status = "primary"
          let statusColor = "#1890ff"
          let icon = "check-circle"
          switch (event.StatusId) {
            case api.STATUS_ITEM.NEW:
            case api.STATUS_ITEM.IN_PROGRESS:
              status = "primary"
              statusColor = "#1890ff"
              icon = "check-circle"
              break
            case api.STATUS_ITEM.ON_HOLD:
              status = "warning"
              statusColor = "#faad14"
              icon = "check-circle"
              break
            case api.STATUS_ITEM.COMPLETED:
              status = "success"
              statusColor = "#52c41a"
              icon = "list"
              break
            case api.STATUS_ITEM.CANCELED:
              status = "default"
              statusColor = "#d9d9d9"
              icon = "ban"
              break
            default:
              break
          }

          const title = (
            <span className="critical-item-title">
              <Row>
                <Col sm={2}>
                  <Icon size="2x" name={icon} style={{ color: "white" }} />{" "}
                </Col>
                <Col sm={10}>
                  <span style={{ color: "white" }}>{event.JobName}</span>
                  <br />
                  <span style={{ color: "#d8d8d8" }}>
                    {`${format(event.ScheduledDate, "M/DD/YYYY hh:mm A")}`}
                  </span>
                </Col>
              </Row>
            </span>
          )
          const popover = (
            <Popover
              key={index}
              id="popover-critical-item"
              title={title}
              className="rectangle"
            >
              <ul className="critical-item">
                <li>
                  <Tooltip
                    placement="right"
                    title={`Click to view job # ${event.JobNumber}`}
                    mouseEnterDelay={0.5}
                  >
                    <Link
                      to={`/jobs/${event.JobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{event.JobNumber}</span>
                    </Link>
                  </Tooltip>
                  <br />
                  <span className="critical-item-header">{`Job #`}</span>
                  <Tag className="pull-right" color={statusColor}>
                    {event.StatusName}
                  </Tag>
                </li>
                {event.CriticalDateTypeId && <li>
                  <span className="critical-item-value">
                    {event.CriticalDateType}
                  </span>
                  <br />
                  <span className="critical-item-header">{`Category`}</span>
                </li>}
                <li>
                  <span className="critical-item-value">
                    {event.VendorName}
                  </span>
                  <br />
                  <span className="critical-item-header">{`Vendor`}</span>
                </li>
                <li>
                  <span className="critical-item-value">{`${
                    site ? site.SiteAddress : ""
                  }`}</span>
                  <br />
                  <span className="critical-item-header">{`Address`}</span>
                </li>

                {asset && (
                  <span>
                    <li>
                      <span className="critical-item-value">{`${asset.AssetName ||
                        "N/A"}`}</span>
                      <br />
                      <span className="critical-item-header">{`Asset`}</span>
                    </li>
                    <li>
                      <span className="critical-item-value">{`${asset.Make ||
                        "N/A"}`}</span>
                      <br />
                      <span className="critical-item-header">{`Make`}</span>
                    </li>
                    <li>
                      <span className="critical-item-value">{`${asset.Model ||
                        "N/A"}`}</span>
                      <br />
                      <span className="critical-item-header">{`Model`}</span>
                    </li>
                    <li>
                      <span className="critical-item-value">{`${asset.SN ||
                        "N/A"}`}</span>
                      <br />
                      <span className="critical-item-header">{`SN`}</span>
                    </li>
                  </span>
                )}
              </ul>
            </Popover>
          )

          return (
            <OverlayTrigger key={event.JobId}
              trigger={["hover", "focus"]}
              placement="left"
              overlay={popover}
            >
              <li>
                <Button bsStyle={status} bsSize="xsmall" key={event.JobId}>
                  <Icon name={icon} /> {event.JobName}{" "}
                </Button>
              </li>
            </OverlayTrigger>
          )
        })}
      </ul>
    )
  }

  getMonthData = month => {
    const { jobsTotalInfo } = this.state
    return jobsTotalInfo.find(t => t.Month === month)
  }

  monthCellRender = value => {
    const data = this.getMonthData(value.month() + 1)
    let formatter = (
      <center>
        <p>
          <Icon name={"info-circle"} style={{ color: "blue" }} />
          {` No critical dates pending `}
        </p>
      </center>
    )

    if (data) {
      //const cards = [
      //  {
      //    id: 0,
      //    title: "Total",
      //    icon: "briefcase",
      //    color: "green",
      //    toolTip: `Total critical dates for the month.`,
      //    value: data.Jobs,
      //  },
      //  {
      //    id: 1,
      //    title: "Upcoming",
      //    icon: "calendar",
      //    color: "#f0ad4e",
      //    toolTip: `Total critical dates for the month that are not yet started.`,
      //    value: data.JobsUpcoming,
      //  },
      //  {
      //    id: 2,
      //    title: "Completed",
      //    icon: "check",
      //    color: "black",
      //    toolTip: `Total critical dates for the month that are finished.`,
      //    value: data.JobsDone,
      //  },
      //  {
      //    id: 3,
      //    title: "Late",
      //    icon: "clock-o",
      //    color: "red",
      //    toolTip: `Total critical dates for the month that are late.`,
      //    value: data.JobsLate,
      //  },
      //]

      formatter = (
        <Tooltip
          placement="right"
          title={"Total critical dates for the month."}
          mouseEnterDelay={0.5}
        >
          <center>
            <h1>{data.Jobs}</h1>
          </center>
        </Tooltip>
        /*
        <List
          grid={{ column: 4 }}
          itemLayout="horizontal"
          pagination={false}
          dataSource={cards}
          renderItem={c => (
            <List.Item key={c.id}>
              <Statistic
                title={c.title}
                value={c.value}
                prefix={
                  <Tooltip
                    placement="right"
                    title={c.toolTip}
                    mouseEnterDelay={0.5}
                  >
                    <Icon name={c.icon} size="1x" style={{ color: c.color }} />
                  </Tooltip>
                }
              />
            </List.Item>
          )}
        />
          */
      )
    }

    return formatter
  }

  render() {
    const className = "critical-dates"
    const {
      showFullScreenDrawer,
      selectedWidget,
      currentDate,
      mode,
    } = this.state

    const { config } = this.props

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching data...
        </Alert>
      )
    }

    return (
      <div className={className}>
        <Drawer
          width={"77%"}
          placement="right"
          onClose={() => this.toggleFullScreen(false, null)}
          visible={showFullScreenDrawer}
          destroyOnClose={true}
        >
          <ExpandedWidget
            config={config}
            onClose={() => this.toggleFullScreen(false, null)}
            widget={selectedWidget}
            showSchedule={false}
          />
        </Drawer>

        <Calendar
          onPanelChange={this.onPanelChange}
          dateCellRender={this.dateCellRender}
          monthCellRender={this.monthCellRender}
          onSelect={this.onSelect}
          value={currentDate}
          mode={mode}
        />
      </div>
    )
  }
}

DOBCalendar.propTypes = propTypes
