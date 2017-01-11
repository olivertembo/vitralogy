import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import moment from "moment"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import { Scrollbars } from "react-custom-scrollbars"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"
import CriticalJobRow from "./CriticalJobRow"

const propTypes = {
  config: PropTypes.object.isRequired,
  autoHeightMax: PropTypes.number,
}

const defaultProps = {
  config: {},
  autoHeightMax: 300,
}

export default class CriticalDatesWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: {
        ActivitySteps: [],
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

    const url =
      config.activeNode.type === api.DASHBOARD_TREE_NODE.SITE
        ? api.CRITICAL_DATES_SITES_DASHBOARD_WIDGET(
            config.activeNode.activeSite.value,
          )
        : api.CRITICAL_DATES_ASSETS_DASHBOARD_WIDGET(
            config.activeNode.activeSite.value,
            config.activeNode.value,
          )

    config.auth
      .request("get", url)
      .query({ beginDate: dtStart })
      .query({ endDate: dtEnd })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({
              data: response.body,
            })
          } else {
            console.log(
              `failed to get critical dates for type: ${
                config.activeNode.type
              }`,
            )
          }
        },
        () => {
          console.log(
            `failed to get critical dates for type: ${config.activeNode.type}`,
          )
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  isExpandableRow = row => {
    if (row.Jobs.length > 0) {
      return true
    }

    return false
  }

  expandComponent = row => {
    return <CriticalJobRow data={row.Jobs} />
  }

  render() {
    const className = "critical-date-widget"
    const options = {
      noDataText: "No Critical Dates Pending!",
      expandRowBgColor: "rgb(51, 122, 183)",
    }
    const scrollStyle = {
      width: "100%",
    }

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching data...
        </Alert>
      )
    }

    if (this.state.data.ActivitySteps.length === 0) {
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
        <Scrollbars
          style={scrollStyle}
          autoHeight
          autoHeightMin={50}
          autoHeightMax={this.props.autoHeightMax}
        >
          <BootstrapTable
            data={this.state.data.ActivitySteps}
            options={options}
            striped
            hover
            condensed
            expandColumnOptions={{ expandColumnVisible: true }}
            expandableRow={this.isExpandableRow}
            expandComponent={this.expandComponent}
          >
            <TableHeaderColumn dataField="ActivityStepId" isKey={true} hidden>
              ActivityStepId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="Name" width="40%">
              {" "}
              Process
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CompletedCount"
              width="20%"
              dataAlign="center"
            >
              Completed
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="ActiveCount"
              width="20%"
              dataAlign="center"
            >
              Active
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="UpcomingCount"
              width="20%"
              dataAlign="center"
            >
              Upcoming
            </TableHeaderColumn>
          </BootstrapTable>
        </Scrollbars>
      </div>
    )
  }
}

CriticalDatesWidget.propTypes = propTypes
CriticalDatesWidget.defaultProps = defaultProps
