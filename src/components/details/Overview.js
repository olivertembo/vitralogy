import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import MomentFormatter from "../MomentFormatter"

const propTypes = {
  data: PropTypes.object,
  auth: PropTypes.object,
  toggleOverview: PropTypes.func.isRequired,
}

const defaultProps = {
  data: {},
  auth: {},
  flags: {},
}

const getState = state => {
  return {
    ...state.lookups,
    ...state.userAccounts,
  }
}

const getActions = dispatch => {
  return {}
}

class Overview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
    }
  }

  get displayName() {
    return "Overview"
  }

  componentDidMount() {}

  render() {
    const placeholder = <span className="placeholder">N/A</span>

    let creationDate = placeholder
    if (
      this.props.data.CreatedOn !== undefined &&
      this.props.data.CreatedOn !== null
    ) {
      creationDate = (
        <MomentFormatter
          datetime={this.props.data.CreatedOn}
          formatter="MM/DD/YYYY hh:mm A"
        />
      )
    }

    return (
      <div className="job-detail__sidebar">
        <i
          className="fa fa-angle-double-left toggle-icon"
          onClick={this.props.toggleOverview}
        />
        <section className="section-title">
          <div className="container-fluid">
            <h1>Customer Details</h1>
          </div>
        </section>
        <section className="job-overview">
          <div className="container-fluid">
            <div className="row customer">
              <div className="section-header">
                <h4>Customer</h4>
              </div>
              <div className="col-sm-12">
                <div className="overview-padding">
                  <ul className="list-unstyled overview-details">
                    <li>
                      <strong>Name : </strong> {this.props.data.Name}
                    </li>
                    <li>
                      <strong>Total Sites : </strong>{" "}
                      {this.props.customerSites.length}
                    </li>
                    <hr />
                    <li>
                      <strong>Created On : </strong> {creationDate}
                    </li>
                    <li>
                      <strong>OnBoarded On : </strong>{" "}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row details">
              <div className="section-header">
                <h4>Details</h4>
              </div>
              <div className="col-sm-12">
                <div className="overview-padding">
                  <ul className="list-unstyled overview-details">
                    <li>
                      <strong>Signed Up On : </strong> {creationDate}
                    </li>
                  </ul>
                </div>
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
