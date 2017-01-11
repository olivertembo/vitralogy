import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import { Scrollbars } from "react-custom-scrollbars"
import Descriptions from "antd/lib/descriptions"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"

const propTypes = {
  config: PropTypes.object.isRequired,
  autoHeightMax: PropTypes.number,
}

const defaultProps = {
  config: {},
  autoHeightMax: 300,
}

export default class AssetInfoWidget extends React.Component {
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

    const url = api.ASSET_DETAILS_DASHBOARD_WIDGET(config.activeNode.value)

    config.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({
              data: response.body.AssetDetails,
            })
          } else {
            console.log("failed to get asset details")
          }
        },
        () => {
          console.log("failed to get asset details")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "asset-details-widget"
    const scrollStyle = {
      width: "100%",
    }
    const { config } = this.props
    const { data } = this.state

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching data...
        </Alert>
      )
    }

    if (data.length === 0) {
      const msg = <div>No attributes specified for asset.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No Asset Information!`}
            message={msg}
          />
        </div>
      )
    }

    const attributes = data.map(a => {
      return (
        <Descriptions.Item key={a.Name} label={a.Name}>
          {a.Value}
        </Descriptions.Item>
      )
    })

    return (
      <div className={className}>
        <Scrollbars
          style={scrollStyle}
          autoHeight
          autoHeightMin={50}
          autoHeightMax={this.props.autoHeightMax}
        >
          <Descriptions
            title={`${config.activeNode.label} Attributes`}
            bordered={true}
            size="small"
            column={{ sm: 2, xs: 1 }}
          >
            {attributes}
          </Descriptions>
        </Scrollbars>
      </div>
    )
  }
}

AssetInfoWidget.propTypes = propTypes
AssetInfoWidget.defaultProps = defaultProps
