import React from "react"
import PropTypes from "prop-types"
import Lightbox from "react-image-lightbox"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import MomentFormatter from "../MomentFormatter"

import EmptyStateContainer from "../../containers/EmptyStateContainer"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  auth: PropTypes.object,
}

const defaultProps = {
  auth: {},
}

export default class FinalizeTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      finalizes: [],
      isFetching: false,
      lightboxOpen: false,
      photoIndex: 0,
    }

    this.openLightbox = this.openLightbox.bind(this)
    this.closeLightbox = this.closeLightbox.bind(this)
  }

  componentDidMount() {
    this.getSignOffs()
  }

  async getData() {
    this.setState({ isFetching: true })
  }

  getSignOffs() {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    const url = `${api.FINALIZE_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ finalizes: response.body.Finalizes })
          } else {
            console.log("failed to get signoffs")
          }
        },
        failure => {
          console.log("failed to get signoffs")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  openLightbox(index) {
    this.setState({
      lightboxOpen: !this.state.lightboxOpen,
      photoIndex: index,
    })
  }

  closeLightbox() {
    this.setState({ lightboxOpen: false })
  }

  render() {
    const className = "finalize-table"

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching signed-offs...
        </Alert>
      )
    }

    if (this.props.data.IsCancelled) {
      return (
        <div className={className}>
          <Alert bsStyle="warning" className="mb-no">
            <h4>Job canceled!</h4>
            This job cannot be signed as it has been canceled.
          </Alert>
        </div>
      )
    }

    if (!this.state.finalizes || this.state.finalizes.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title="No signed-off have been submitted"
            message="Sign-Off is pending."
          />
        </div>
      )
    }

    const { lightboxOpen, photoIndex, finalizes } = this.state

    const signOffs = finalizes.map((item, index) => {
      const mobileToolTip = (
        <Tooltip id="uploadViaToolTip">
          {item.IsMobile ? "Uploaded via mobile" : "Uploaded via web"}
        </Tooltip>
      )

      const offLineToolTip = (
        <Tooltip id="uploadOffLineToolTip">
          {item.IsOffLineSync
            ? "Data capture occurred without connectivity"
            : "Data capture occurred with connectivity"}
        </Tooltip>
      )

      const maxToolTip = (
        <Tooltip id="maxToolTip">
          {`${item.ForUser}'s signature of ${item.Vendor}, `}
          <strong>click</strong> to view in full screen mode
        </Tooltip>
      )

      var uploadBy = " " + item.CreatedBy
      var signOffBy = `${item.ForUser || "N/A"}`
      var signOffOn = (
        <MomentFormatter
          datetime={item.CollectedOn}
          formatter="l LT"
          timezone={item.SiteTimeZoneShortName}
        />
      )

      return (
        <li key={item.JobSourcingTierFinalizeId} className="long">
          <p>
            <div style={{ color: item.Url === null ? "#ea1f1f" : "#000000", fontSize: '24px'}}><strong>{signOffBy}</strong></div>
            <span>{item.Vendor}</span>
          </p>
          {item.Url != null && item.Url.length > 0 && (
            <div className="img-parent-fixed img-thumbnail">
              <div className="img-ratio-sizer" />
              <div className="img-ratio-element">
                <OverlayTrigger placement="left" overlay={maxToolTip}>
                  <img
                    className="card-img-top"
                    src={item.Url}
                    alt=""
                    title=""
                    onClick={() => this.openLightbox(index)}
                  />
                </OverlayTrigger>
              </div>
            </div>
          )}
          <p>
            <strong><span>{uploadBy} {signOffOn}</span></strong>
            <span>
               Uploaded By:&nbsp;
              <span className="icons-color">
                  <OverlayTrigger placement="left" overlay={mobileToolTip}>
                  <Glyphicon glyph={item.IsMobile ? "phone" : "blackboard"} />
                </OverlayTrigger>
                &nbsp;
                <OverlayTrigger placement="top" overlay={offLineToolTip}>
                  <Glyphicon
                    glyph={
                      item.IsOffLineSync ? "cloud-download" : "cloud-upload"
                    }
                  />
                </OverlayTrigger>
              </span>
            </span>

          </p>
          <p>
            <strong>{signOffBy}</strong>
            <span>Signed Off By</span>
          </p>
          {!item.Url && (
            <p>
              <strong>N/A</strong>
            </p>
          )}
        </li>
      )
    })

    return (
      <div>
        <ul className="list-blocks">
          {signOffs}
        </ul>

        {lightboxOpen && (
          <Lightbox
            mainSrc={finalizes[photoIndex].Url}
            nextSrc={finalizes[(photoIndex + 1) % finalizes.length].Url}
            prevSrc={
              finalizes[
                (photoIndex + (finalizes.length - 1)) % finalizes.length
              ].Url
            }
            onCloseRequest={() => this.closeLightbox()}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex:
                  (photoIndex + (finalizes.length - 1)) % finalizes.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % finalizes.length,
              })
            }
            imageTitle={`Uploaded by ${
              finalizes[photoIndex].CreatedBy
            } on ${format(finalizes[photoIndex].CollectedOn, "l LT")} ${
              finalizes[photoIndex].SiteTimeZoneShortName
            }`}
            imageCaption={finalizes[photoIndex].Description}
          />
        )}
      </div>
    )
  }
}

FinalizeTable.propTypes = propTypes
FinalizeTable.defaultProps = defaultProps
