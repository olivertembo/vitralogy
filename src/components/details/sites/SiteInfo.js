import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import SweetAlert from "react-bootstrap-sweetalert"
import Button from "react-bootstrap/lib/Button"

import ToastHelper from "../../../utils/ToastHelper"
import * as api from "../../../constants/api"
import {
  selectSite,
  clearSiteItems,
  getSiteDetails,
  setSiteDetails,
} from "../../../actions/sites"
import { format } from "../../../utils/datetime"

const propTypes = {
  _site: PropTypes.object.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    _site: { ...state.sites },
  }
}

const getActions = dispatch => {
  return {
    selectSite: tier => dispatch(selectSite(tier)),
    clearSiteItems: () => dispatch(clearSiteItems()),
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
    setSiteDetails: details => dispatch(setSiteDetails(details)),
  }
}

class SiteInfo extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      alert: null,
      isGeocoding: false,
    }

    this.hideAlert = this.hideAlert.bind(this)
    this.showGeoCodeWindow = this.showGeoCodeWindow.bind(this)
    this.geoCode = this.geoCode.bind(this)
    this.onGeoUpdate = this.onGeoUpdate.bind(this)
  }

  get displayName() {
    return "SiteInfo"
  }

  hideAlert() {
    this.setState({ alert: null })
  }

  onGeoUpdate(data) {
    //console.log('data: ' + JSON.stringify(data))

    if (data.IsSuccess === true) {
      const newSiteData = Object.assign({}, this.props._site.selectedDetails, {
        IsGeoCodingNeeded: data.IsGeoCodingNeeded,
        GeoCodingUpdatedOn: data.GeoCodingUpdatedOn,
        Latitude: data.Latitude,
        Longitude: data.Longitude,
      })
      this.props.setSiteDetails(newSiteData)

      console.log(
        `${
          this.props._site.selectedDetails.SiteAddress
        } successfully geocoded: ${JSON.stringify(data)}`,
      )
      ToastHelper.success(
        `${this.props._site.selectedDetails.Name} successfully geocoded`,
      )
    } else {
      ToastHelper.error(data.Msg)
    }
  }

  showGeoCodeWindow() {
    let mesg = (
      <span>
        Are you sure you wish to geocode the{" "}
        {this.props._site.selectedDetails.Name} site, located at{" "}
        {this.props._site.selectedDetails.SiteAddress}?
      </span>
    )
    this.setState({
      alert: (
        <SweetAlert
          title="Geocode Site"
          custom
          showCancel
          customIcon={require("../../../assets/images/question.png")}
          confirmBtnText="Yes, Geocode!"
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="default"
          onConfirm={this.geoCode}
          onCancel={this.hideAlert}
        >
          {mesg}
        </SweetAlert>
      ),
    })
  }

  geoCode() {
    this.setState({
      isGeocoding: true,
      alert: null,
    })

    console.log(
      "Geocoding address #" + this.props._site.selectedDetails.AddressId,
    )
    let url = api.GEOCODE_ADDRESS

    this.props.auth
      .request("post", url)
      .query({ addressId: this.props._site.selectedDetails.AddressId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          this.onGeoUpdate(response.body)
        },
        () => {
          console.log(
            `failure to geocode ${this.props._site.selectedDetails.Name}`,
          )
        },
      )
      .then(() => {
        this.setState({
          isGeocoding: false,
        })
      })
  }

  render() {
    if (this.props._site.isLoadingDetails === true) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching site info...
        </Alert>
      )
    }

    const placeholder = <span className="placeholder">N/A</span>
    const selected = this.props._site.selectedDetails
    const mapsLink = `http://maps.google.com/?q=${selected.SiteAddress}`
    const addrToolTip = (
      <Tooltip id="addrToolTip">{`Click to view ${
        selected.SiteAddress
      } on Google maps`}</Tooltip>
    )
    const geoToolTip = (
      <Tooltip id="geoToolTip">
        {selected.IsGeoCodingNeeded === true ? (
          `Site requires geocoding, click to geocode`
        ) : (
          <ul className="list-unstyled geo-details">
            <li>
              <strong>Coded On&nbsp;: </strong>{" "}
              {format(selected.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")}
            </li>
            <li>
              <strong>Latitude&nbsp;&nbsp;&nbsp;&nbsp;: </strong>{" "}
              {selected.Latitude}{" "}
            </li>
            <li>
              <strong>Longitude&nbsp;: </strong> {selected.Longitude}{" "}
            </li>
            <br />
            <li>Click to geocode site again</li>
          </ul>
        )}
      </Tooltip>
    )

    let lastUpdatedDate = placeholder
    if (
      selected.LastUpdatedOn !== undefined &&
      selected.LastUpdatedOn !== null
    ) {
      lastUpdatedDate = format(selected.LastUpdatedOn, "MM/DD/YYYY hh:mm A")
    }

    return (
      <ul className="list-unstyled resource-details">
        {this.state.alert}

        <li>
          <strong>Name : </strong>&nbsp;
          {selected.Name.length > 0 ? selected.Name : placeholder}
        </li>
        <li>
          <strong>Address : </strong>&nbsp;
          <OverlayTrigger overlay={addrToolTip} placement="top">
            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
              {selected.SiteAddress}
            </a>
          </OverlayTrigger>
          &nbsp;
          <OverlayTrigger overlay={geoToolTip} placement="top">
            <Button
              bsStyle="link"
              bsClass="btn-inline"
              disabled={this.state.isGeocoding === true}
              onClick={() => this.showGeoCodeWindow()}
            >
              <Icon
                name="globe"
                style={{
                  color: selected.IsGeoCodingNeeded === true ? "red" : "blue",
                }}
              />
            </Button>
          </OverlayTrigger>
        </li>
        {this.state.isGeocoding && (
          <li>
            <Icon spin name="spinner" />
            &nbsp;Geocoding {selected.Name}
          </li>
        )}
        <li>
          <strong>Time Zone : </strong>&nbsp;
          {selected.SiteTimeZone.length > 0
            ? selected.SiteTimeZone
            : placeholder}
        </li>
        <li>
          <strong>Geo Coded : </strong>&nbsp;
          {selected.IsGeoCodingNeeded === true
            ? "No"
            : format(selected.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")}
        </li>
        <li>
          <strong>Updated On : </strong>&nbsp;{lastUpdatedDate}
        </li>
      </ul>
    )
  }
}

SiteInfo.propTypes = propTypes
SiteInfo.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(SiteInfo)
