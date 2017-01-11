import React from "react"
import Icon from "react-fa/lib/Icon"
import { Scrollbars } from "react-custom-scrollbars"
import { Button } from "react-bootstrap"
import { format } from "../../../utils/datetime"

export default function CommentList({ auth, comments }) {
  if (comments.length === 0) {
    return (
      <div className="proof-loader">
        <div className="loading">
          <p>Be the first to comment on this line item!</p>
        </div>
      </div>
    )
  }

  const scrollStyle = {
    width: "100%",
    height: 300,
  }

  return (
    <Scrollbars
      style={scrollStyle}
      autoHeight
      autoHeightMin={25}
      autoHeightMax={300}
    >
      {comments.map(comment => {
        let proofInfo = null
        if (comment.validationMethod) {
          let fileDownloadButton = null
          if (comment.proofItemUrl) {
            fileDownloadButton = (
              <Button
                bsStyle="link"
                className="btn-anchor"
                onClick={() => {
                  auth.downloadFile(comment.proofItemUrl, comment.fileName)
                }}
              >
                Download
              </Button>
            )
          }
          proofInfo = (
            <React.Fragment>
              <span className="meta">{comment.validationMethod}</span>{" "}
              {fileDownloadButton}
            </React.Fragment>
          )
        }

        return (
          <div className="activity-comment-wrapper" key={comment.commentId}>
            <div className="activity-comment-meta">
              <Icon className="text-muted" name="user-circle-o" />
              <strong> {comment.commentedBy}</strong> ({comment.companyName})
              {" added a comment - "}
              {format(comment.commentedOn, "MMMM DD, YYYY, h:mm A")}
              {` ${comment.timeZone}`}
            </div>
            <div className="activity-comment-info">{proofInfo}</div>
            <div className="activity-comment-text">
              <p>{comment.text}</p>
            </div>
          </div>
        )
      })}
    </Scrollbars>
  )
}
