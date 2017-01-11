import React from "react"
import moment from "moment"
import Masonry from "react-masonry-component"
import PropTypes from "prop-types"
import Lightbox from "react-image-lightbox"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Label from "react-bootstrap/lib/Label"
import { default as ToolTip } from "antd/lib/tooltip"

import * as api from "../../../constants/api"
import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import { format } from "../../../utils/datetime"

const masonryOptions = {
  transitionDuration: "0.2s",
  gutter: 10,
}

const propTypes = {
  auth: PropTypes.object.isRequired,
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  jobResourceId: null,
  auth: {},
  photos: [],
}

export default class ResourcePicturesTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      photos: [],
      isFetching: false,
      lightboxOpen: false,
      photoIndex: 0,
    }

    this.openLightbox = this.openLightbox.bind(this)
    this.closeLightbox = this.closeLightbox.bind(this)
    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
  }

  componentDidMount() {
    // Handle first resource loaded
    this.getPhotos()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getPhotos(nextProps.resource.JobResourceId)
    }
  }

  getPhotos(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.PHOTOS_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ photos: response.body.Photos })
          } else {
            console.log("failed to get photos issuccess = false")
          }
        },
        () => {
          console.log("failed to get photos")
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

  uploadedByFormatter(photo) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {photo.IsCreatedByMobile ? "Uploaded via mobile" : "Uploaded via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="uploadOffLineToolTip">
        {photo.IsCreatedByOffLineSync
          ? "Data capture occurred without connectivity"
          : "Data capture occurred with connectivity"}
      </Tooltip>
    )

    var format = " "
    return (
      <span  className="icons-color">
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon glyph={photo.IsCreatedByMobile ? "phone" : "blackboard"} />
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger placement="top" overlay={offLineToolTip}>
          <Glyphicon
            glyph={
              photo.IsCreatedByOffLineSync ? "cloud-download" : "cloud-upload"
            }
          />
        </OverlayTrigger>
        {format}
      </span>
    )
  }

  render() {
    const className = "resource-photos"
    const { lightboxOpen, photoIndex, photos } = this.state
    const emptyTitle =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "No resource photos!"
        : "No job photos!"
    const emptyMesg =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "Subcontractor has not uploaded any photos for resource at this time."
        : "Subcontractor has not uploaded any photos for job at this time."

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp; Fetching photos...
        </Alert>
      )
    }

    if (photos === undefined || photos.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={emptyTitle}
            message={emptyMesg}
          />
        </div>
      )
    }
    const completionDate = null //TODO

    const masonryPhotos = photos.map((photo, index) => {
      const collectedMoment = moment(photo.CollectedOn)
      const uploadedAfterCompletion = completionDate
        ? completionDate.isBefore(collectedMoment)
        : false
      return (
        <li key={photo.JobPhotoId}>
          <figure>
            <div class="image-border">
              <ToolTip
                trigger={["hover"]}
                title={`Click to view photo in full screen`}
                placement="topLeft"
                arrowPointAtCenter
              >
                <a
                  href="/"
                  onClick={e => {
                    e.preventDefault()
                    this.openLightbox(index)
                  }}
                >
                  <img alt="" src={photo.Url} />
                </a>
              </ToolTip>
            </div>
            <figcaption>
              <p>{photo.Description}</p>
              <p>
                <strong>
                  {format(photo.CollectedOn, "l LT")}{" "}
                  {photo.SiteTimeZoneShortName}{" "}
                </strong>
                <span>Added On</span>
              </p>
              <p>
                <strong>
                   {photo.CreatedBy} -{" "}
                  {photo.Vendor}{" "}
                </strong>
                <span>Added By {this.uploadedByFormatter(photo)}</span>
              </p>

              {uploadedAfterCompletion && (
                <Tooltip
                  trigger={["hover"]}
                  title={`Photo uploaded after the job was closed`}
                  placement="topLeft"
                  arrowPointAtCenter
                >
                  <Label className="col-sm-12" bsStyle="info">
                    POST COMPLETION
                  </Label>
                </Tooltip>
              )}
            </figcaption>
          </figure>
        </li>
      )
    })

    return (
      <div className={className}>
        <Masonry options={masonryOptions}>
          <div className="list-blocks">
            {masonryPhotos}
          </div>
        </Masonry>

        {lightboxOpen && (
          <Lightbox
            mainSrc={photos[photoIndex].Url}
            nextSrc={photos[(photoIndex + 1) % photos.length].Url}
            prevSrc={
              photos[(photoIndex + (photos.length - 1)) % photos.length].Url
            }
            onCloseRequest={() => this.closeLightbox()}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + (photos.length - 1)) % photos.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % photos.length,
              })
            }
            imageTitle={`Uploaded by ${
              photos[photoIndex].CreatedBy
            } on ${format(photos[photoIndex].CollectedOn, "l LT")} ${
              photos[photoIndex].SiteTimeZoneShortName
            }`}
            imageCaption={photos[photoIndex].Description}
          />
        )}
      </div>
    )
  }
}

ResourcePicturesTable.propTypes = propTypes
ResourcePicturesTable.defaultProps = defaultProps
