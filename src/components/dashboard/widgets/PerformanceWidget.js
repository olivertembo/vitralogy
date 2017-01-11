import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import moment from "moment"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import { Scrollbars } from "react-custom-scrollbars"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"
import ServiceProviderRow from "./ServiceProviderRow"

const propTypes = {
  config: PropTypes.object.isRequired,
  autoHeightMax: PropTypes.number,
}

const defaultProps = {
  config: {},
  autoHeightMax: 300,
}

export default class PerformanceWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: {
        TotalCount: 0,
        ServiceProviders: [],
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

    const url = `${api.VENDOR_PERFORMANCE_DASHBOARD_WIDGET}`

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
            this.setState({
              data: response.body,
            })
          } else {
            console.log("failed to get subcontractor performance stats")
          }
        },
        () => {
          console.log("failed to get subcontractor performance stats")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  isExpandableRow = row => {
    if (row.Users.length > 0) {
      return true
    }

    return false
  }

  expandComponent = row => {
    return <ServiceProviderRow data={row.Users} />
  }

  render() {
    const className = "performance-widget"
    const options = {
      noDataText: "No Services Performed!",
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

    if (
      this.state.data.TotalCount === 0 ||
      this.state.data.ServiceProviders.length === 0
    ) {
      const msg = <div>No rendered services for the specified interval.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No Services Performed!`}
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
            data={this.state.data.ServiceProviders}
            options={options}
            striped
            hover
            condensed
            expandColumnOptions={{ expandColumnVisible: true }}
            expandableRow={this.isExpandableRow}
            expandComponent={this.expandComponent}
          >
            <TableHeaderColumn dataField="ActiveVendorId" isKey={true} hidden>
              ActiveVendorId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ActiveVendor">
              {" "}
              Service Provider
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="RecordsCount"
              dataAlign="center"
              width="40%"
            >
              Jobs Completed
            </TableHeaderColumn>
          </BootstrapTable>
        </Scrollbars>
      </div>
    )
  }
}

PerformanceWidget.propTypes = propTypes
PerformanceWidget.defaultProps = defaultProps
