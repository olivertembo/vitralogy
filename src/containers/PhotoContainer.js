import React from "react"
import PropTypes from "prop-types"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import Lightbox from "react-image-lightbox"
import Masonry from "react-masonry-component"
import Tooltip from "antd/lib/tooltip"

import ToastHelper from "../utils/ToastHelper"
import EmptyStateContainer from "./EmptyStateContainer"
import OverlayButton from "../components/layout/OverlayButton"
import * as api from "../constants/api"
import PhotoAdd from "../components/jobs/PhotoAdd"
import { format } from "../utils/datetime"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object,
}

const defaultProps = {
  items: [],
}

const masonryOptions = {
  transitionDuration: "0.2s",
  columnWidth: ".grid-sizer",
  gutter: ".gutter-sizer",
}

export default class PhotoContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      isFetching: false,
      lightboxOpen: false,
      photoIndex: 0,
    }

    this.handleAdd = this.handleAdd.bind(this)
    this.onPhotoAdded = this.onPhotoAdded.bind(this)
    this.openLightbox = this.openLightbox.bind(this)
    this.closeLightbox = this.closeLightbox.bind(this)
  }

  componentDidMount() {
    this.getItems()
  }

  getItems() {
    if (this.state.isFetching || this.props.jobId === 0) {
      return
    }

    this.setState({ isFetching: true })

    const url = `${api.PHOTOS_ENDPOINT}${this.props.jobId}`
    console.log(`Retrieving job level photos: ${url}...`)

    this.props.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ items: response.body.Photos })
          } else {
            console.log("failure to get job level photos")
          }
        },
        () => {
          console.log("failure to get job level photos")
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

  handleAdd() {
    this.setState({ showAdd: !this.state.showAdd })
  }

  onPhotoAdded(success) {
    this.handleAdd()
    if (success) {
      this.getItems()
      ToastHelper.success("Photo submitted successfully.")
    } else {
      ToastHelper.error("Error submitting photo!")
    }
  }

  render() {
    const className = "photo-container"
    const addTooltip = "Add a photo to the job."
    const { lightboxOpen, photoIndex, items } = this.state

    const masonryPhotos = items.map((item, index) => {
      const tooltip = `Added by ${item.CreatedBy} from ${
        item.Vendor
      } on ${format(item.CollectedOn, "l LT")} ${
        item.SiteTimeZoneShortName
      } - ${item.Description}`
      return (
        <div className="tile" key={item.JobPhotoId}>
          <a
            href="/"
            onClick={e => {
              e.preventDefault()
              this.openLightbox(index)
            }}
          >
            <figure>
              <Tooltip
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
                  <img
                    alt={tooltip}
                    title={tooltip}
                    className="mb-sm"
                    src={item.Url}
                  />
                </a>
              </Tooltip>
            </figure>
          </a>
        </div>
      )
    })

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching photos...
        </Alert>
      )
    }

    if (items === undefined || items.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title="No job level photos!"
            message="Add photos here that will be seen by subcontractors."
          />
          <br />

          {this.state.showAdd && (
            <PhotoAdd
              show={this.state.showAdd}
              auth={this.props.auth}
              onCloseClick={this.handleAdd}
              jobId={this.props.jobId}
              onPhotoAdded={this.onPhotoAdded}
            />
          )}

          <OverlayButton
            className="pull-right"
            bsSize="small"
            bsStyle="info"
            glyph="plus"
            disabled={false}
            text={addTooltip}
            onClick={this.handleAdd}
          >
            {" "}
            Add
          </OverlayButton>
        </div>
      )
    }

    return (
      <div className={className}>
        {this.state.showAdd && (
          <PhotoAdd
            show={this.state.showAdd}
            auth={this.props.auth}
            onCloseClick={this.handleAdd}
            jobId={this.props.jobId}
            onPhotoAdded={this.onPhotoAdded}
          />
        )}

        <OverlayButton
          className="pull-right"
          bsSize="small"
          bsStyle="info"
          glyph="plus"
          disabled={false}
          text={addTooltip}
          onClick={this.handleAdd}
        >
          {" "}
          Add
        </OverlayButton>
        <br />
        <br />

        <div className="row">
          <div className="col-sm-12">
            <Masonry options={masonryOptions}>
              <div className="gutter-sizer" />
              <div className="grid-sizer" />
              {masonryPhotos}
            </Masonry>
          </div>
        </div>

        {lightboxOpen && (
          <Lightbox
            mainSrc={items[photoIndex].Url}
            nextSrc={items[(photoIndex + 1) % items.length].Url}
            prevSrc={
              items[(photoIndex + (items.length - 1)) % items.length].Url
            }
            onCloseRequest={() => this.closeLightbox()}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + (items.length - 1)) % items.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % items.length,
              })
            }
            imageTitle={`Uploaded by ${items[photoIndex].CreatedBy} on ${format(
              items[photoIndex].CollectedOn,
              "l LT",
            )} ${items[photoIndex].SiteTimeZoneShortName}`}
            imageCaption={items[photoIndex].Description}
          />
        )}
      </div>
    )
  }
}

PhotoContainer.propTypes = propTypes
PhotoContainer.defaultProps = defaultProps
