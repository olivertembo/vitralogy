import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"

const PostingButton = ({
  canSubmit,
  isPosting,
  onClick,
  text,
  postingText,
}) => (
  <Button
    disabled={!canSubmit || isPosting}
    formNoValidate={true}
    onClick={onClick}
  >
    {isPosting ? (
      <span>
        <Icon spin name="spinner" /> {postingText}...
      </span>
    ) : (
      text
    )}
  </Button>
)

PostingButton.propTypes = {
  text: PropTypes.string,
  postingText: PropTypes.string,
  canSubmit: PropTypes.bool,
  isPosting: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

PostingButton.defaultProps = {
  text: "Submit",
  postingText: "Submitting",
  canSubmit: true,
}

export default PostingButton
