import PropTypes from "prop-types"
import React from "react"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView"

import ToastHelper from "../../utils/ToastHelper"
import OverlayButton from "../layout/OverlayButton"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import CommentAdd from "./CommentAdd"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

import { ReactComponent as CommentIcon } from "../../assets/icons/brand/comments.svg"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object.isRequired,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
}

const defaultProps = {
  pageNumber: 1,
  pageSize: 25,
  auth: {},
}

export default class CommentTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      comments: [],
      isFetching: false,
      showAddComment: false,
    }
  }

  componentWillMount() {
    this.getComments()
  }

  getComments = () => {
    if (this.state.isFetching || this.props.jobId === 0) {
      return
    }
    this.setState({ isFetching: true })

    const url = `${api.COMMENTS_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ pageNumber: this.props.pageNumber })
      .query({ pageSize: this.props.pageSize })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ comments: response.body.JobComments })
          } else {
            console.log("failure to get comments")
          }
        },
        () => {
          console.log("failure to get comments")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  handleOpenCloseAddComment = () => {
    this.toggleAddComment()
  }

  toggleAddComment = () => {
    this.setState({ showAddComment: !this.state.showAddComment })
  }

  onCommentAdded = success => {
    this.handleOpenCloseAddComment()
    if (success) {
      this.getComments()
      ToastHelper.success("Comments submitted successfully.")
    } else {
      ToastHelper.error("Error submitting comment!")
    }
  }

  render() {
    const className = "comment-table"
    const addTooltip = this.props.isLocked
      ? this.props.lockedReason
      : "Add a comment to the job."

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching comments...
        </Alert>
      )
    }

    if (this.state.comments === undefined || this.state.comments.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title="No job comments added!"
            message="Post a comment to this job"
          />
          <br />

          {this.state.showAddComment && (
            <CommentAdd
              show={this.state.showAddComment}
              auth={this.props.auth}
              onCloseClick={this.handleOpenCloseAddComment}
              onCommentAdded={this.onCommentAdded}
              jobId={this.props.jobId}
            />
          )}

          <OverlayButton
            className="pull-right"
            bsSize="small"
            bsStyle="info"
            glyph="plus"
            disabled={false}
            text={addTooltip}
            onClick={this.handleOpenCloseAddComment}
          >
            {" "}
            Add
          </OverlayButton>
          <br />
          <br />
        </div>
      )
    }

    const commentNodes = this.state.comments.map(comment => {
      return (
        <div className="comment public" key={comment.JobCommentId}>
          <div className="comment__body">
            {comment.Subject} <br />
            {comment.IsRequiredFollowUp && (
              <span>
                <span
                  className={
                    comment.IsConfirmed ? "follow-up confirmed" : "follow-up"
                  }
                >
                  *
                  {comment.FollowUpAssignedToUserAccount === null
                    ? "Someone "
                    : comment.FollowUpAssignedToUserAccountName}{" "}
                  needs to follow up on{" "}
                  {format(comment.FollowUpDate, "ddd l [@] LT")}{" "}
                  {comment.SiteTimeZoneShortName}
                  &nbsp;
                </span>
                {comment.IsConfirmed && (
                  <span className="follow-up confirmed message">
                    - Follow Up confirmed on{" "}
                    {format(comment.ConfirmedDate, "ddd l LT")}{" "}
                    {comment.SiteTimeZoneShortName} by{" "}
                    {comment.ConfirmedByUserAccountName} (
                    {<FroalaEditorView model={comment.ConfirmationComment} />})
                  </span>
                )}
              </span>
            )}
          <strong><FroalaEditorView model={comment.Comment} /></strong>
          <span>{comment.CommentType}</span> <br/><br/>
          </div>
          <div>
            <strong>{comment.CreatedBy}
              from {comment.AccountName}.
              {format(comment.CreatedOn, "l [at] LT")}{" "}
              {comment.SiteTimeZoneShortName}
            </strong><br/>
            <span>Added A Comment</span>
            <br />
          </div>
        </div>
      )
    })

    return (
      <div className={className}>
        {this.state.showAddComment && (
          <CommentAdd
            show={this.state.showAddComment}
            auth={this.props.auth}
            onCloseClick={this.handleOpenCloseAddComment}
            onCommentAdded={this.onCommentAdded}
            jobId={this.props.jobId}
          />
        )}

        <div className="row">
          <div className="col-sm-12">
            <div className="comments">{commentNodes}</div>

            {/* <a href="#">View all comments</a> */}
            <button
              className="roundButton"
              onClick={this.handleOpenCloseAddComment}
            >
              <CommentIcon className="icon" />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

CommentTable.propTypes = propTypes
CommentTable.defaultProps = defaultProps
