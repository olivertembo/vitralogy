import React from "react"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import { camelizeKeys } from "humps"
import Formsy from "formsy-react"
import { Textarea } from "formsy-react-components"
import { SNOW_COMMENTS_FOR_LINE_ITEM } from "../../../constants/api"

function AddCommentForm({ auth, item, onCommentAdded }) {
  const formRef = React.useRef(null)
  const [isPosting, setIsPosting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [canSubmit, setCanSubmit] = React.useState(false)

  const postComment = () => {
    setIsPosting(true)
    setError(null)

    const { invoiceId, lineItemId } = item
    const { comment } = formRef.current.getModel()

    auth
      .request("post", SNOW_COMMENTS_FOR_LINE_ITEM(invoiceId, lineItemId))
      .send({ comment })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            onCommentAdded(json.newComment)
          } else {
            // error
            setError(json.msg)
          }
        },
        () => {
          // error
          setError("An error occurred, unable to post comment.")
        },
      )
      .then(() => {
        if (!error) {
          formRef.current.reset()
        }
        setIsPosting(false)
      })
  }

  const enableSubmit = () => setCanSubmit(true)

  const disableSubmit = () => setCanSubmit(false)

  return (
    <Formsy ref={formRef} onValid={enableSubmit} onInvalid={disableSubmit}>
      <Textarea
        name="comment"
        placeholder="Additional comments / notes"
        rows="10"
        cols="20"
        label="Comments"
        layout="vertical"
        required
      />
      <Button
        formNoValidate={true}
        onClick={postComment}
        disabled={isPosting || !canSubmit}
      >
        {isPosting ? (
          <span>
            <Icon name="spinner" spin /> Submitting...
          </span>
        ) : (
          "Submit"
        )}
      </Button>
    </Formsy>
  )
}

export default AddCommentForm
