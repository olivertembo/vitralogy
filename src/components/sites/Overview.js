import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import { connect } from "react-redux"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import * as api from "../../constants/api"
import { getSiteDetails, clearSiteDetails } from "../../actions/site"
import { format } from "../../utils/datetime"

const propTypes = {
  data: PropTypes.object,
  auth: PropTypes.object,
  toggleOverview: PropTypes.func.isRequired,
}

const defaultProps = {
  data: {},
  auth: {},
}

const getState = state => {
  return {
    _site: {
      ...state.site,
    },
  }
}

const getActions = dispatch => {
  return {
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
    clearSiteDetails: () => dispatch(clearSiteDetails()),
  }
}

class Overview extends React.Component {
  get displayName() {
    return "Overview"
  }

  render() {
    if (this.props.data.details === null) {
      return (
        <div className="job-detail">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading Site Details...
          </div>
        </div>
      )
    }

    const placeholder = <span className="placeholder">N/A</span>
    const details = this.props.data.details
    const mapsLink = `http://maps.google.com/?q=${details.SiteAddress}`
    const addrToolTip = (
      <Tooltip id="addrToolTip">{`Click to view ${
        details.SiteAddress
      } on Google maps`}</Tooltip>
    )

    const geoToolTip = (
      <Tooltip id="geoToolTip">
        {details.IsGeoCoded === false ? (
          `Site requires geocoding, please contact Vitralogy Support to update`
        ) : (
          <ul className="list-unstyled geo-details">
            <li>
              <strong>Coded On&nbsp;:&nbsp;</strong>
              {details.GeoCodingUpdatedOn === null
                ? "Unknown"
                : format(details.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")}
            </li>
            <li>
              <strong>Latitude&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;</strong>
              {details.Latitude}
            </li>
            <li>
              <strong>Longitude&nbsp;:&nbsp;</strong>
              {details.Longitude}
            </li>
          </ul>
        )}
      </Tooltip>
    )

    const siteFormat = (
      <span>
        <OverlayTrigger overlay={addrToolTip} placement="top">
          <a href={mapsLink} target="_blank">
            {details.SiteAddress}
          </a>
        </OverlayTrigger>
        &nbsp;
        <span>
          <OverlayTrigger overlay={geoToolTip} placement="top">
            <Icon
              name="globe"
              style={{
                color: details.IsGeoCoded === false ? "red" : "blue",
              }}
            />
          </OverlayTrigger>
        </span>
      </span>
    )

    let lastUpdatedDate = placeholder
    if (details.LastUpdatedOn !== undefined && details.LastUpdatedOn !== null) {
      lastUpdatedDate = `${format(details.LastUpdatedOn, "MM/DD/YYYY hh:mm A")}`
    }

    let formattedSiteName = placeholder
    if (
      details.Name !== undefined &&
      details.Name !== null &&
      details.Name.length > 0
    ) {
      formattedSiteName = details.Name
    }

    let formattedSiteTimeZone = placeholder
    if (
      details.SiteTimeZone !== undefined &&
      details.SiteTimeZone !== null &&
      details.SiteTimeZone.length > 0
    ) {
      formattedSiteTimeZone = details.SiteTimeZone
    }

    let formattedGeoCodedDate = "No"
    if (
      details.IsGeoCodingNeeded !== undefined &&
      details.IsGeoCodingNeeded !== null
    ) {
      formattedGeoCodedDate = details.IsGeoCodingNeeded
        ? "No"
        : format(details.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")
    }

    return (
      <div className="job-detail__sidebar">
        <i
          className="fa fa-angle-double-left toggle-icon"
          onClick={this.props.toggleOverview}
        />
        <section className="section-title">
          <div className="container-fluid">
            <h1>Site Details</h1>
          </div>
        </section>
        <section className="job-overview">
          <div className="container-fluid">
            <div className="row customer">
              <div className="section-header">
                <h4>Details</h4>
              </div>
              <div className="col-sm-12">
                <div className="overview-padding">
                  <ul className="list-unstyled overview-details">
                    <li>
                      <strong>Name :</strong>&nbsp;{formattedSiteName}
                    </li>
                    <li>
                      <strong>Address :</strong>&nbsp;{siteFormat}
                    </li>
                    <hr />
                    <li>
                      <strong>Time Zone :</strong>&nbsp;{formattedSiteTimeZone}
                    </li>
                    <li>
                      <strong>Geo Coded :</strong>&nbsp;{formattedGeoCodedDate}
                    </li>
                    <li>
                      <strong>Updated On :</strong>&nbsp;{lastUpdatedDate}
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
