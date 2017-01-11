import React from "react"
import { camelizeKeys } from "humps"
import Modal from "react-bootstrap/lib/Modal"
import Button from "react-bootstrap/lib/Button"
import ReactGA from "react-ga"
import AddCommentForm from "./AddCommentForm"
import * as api from "../../../constants/api"
import ProofLoader from "../proofModal/ProofLoader"
import { Track } from "../../analytics"
import CommentList from "./CommentList"

function CommentModal({ auth, item, show, onHide, dialogClassName, title }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [comments, setComments] = React.useState([])
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    ReactGA.modalview(`/invoices/comment/${item.lineItemId}`)

    const getData = () => {
      const { invoiceId, lineItemId } = item
      auth
        .request("get", api.SNOW_COMMENTS_FOR_LINE_ITEM(invoiceId, lineItemId))
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            const json = camelizeKeys(response.body)

            if (json.isSuccess === true) {
              setComments(json.comments)
            } else {
              setError(json.msg)
            }
          },
          () => {
            setError("Unable to load comments")
          },
        )
        .then(() => {
          setIsLoading(false)
        })
    }

    getData()
  }, [])

  const handleCommentAdded = comment => {
    const updatedComments = [...comments]
    updatedComments.unshift(comment)

    setComments(updatedComments)
  }

  let body = <ProofLoader msg="Loading comments..." />

  if (!isLoading && error) {
    body = `An error occurred: ${error}`
  } else {
    body = (
      <React.Fragment>
        <CommentList auth={auth} comments={comments} />

        <div className="mt-lg">
          <AddCommentForm
            auth={auth}
            item={item}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </React.Fragment>
    )
  }

  return (
    <Modal
      backdrop="static"
      show={show}
      onHide={onHide}
      dialogClassName={dialogClassName}
      bsSize="large"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Activity</h4>
        {isLoading && <ProofLoader msg="Loading comments..." />}
        {body}
      </Modal.Body>
      <Modal.Footer>
        <Track
          category="Invoices"
          action="Close Clicked"
          label="Comment Modal"
          value={item.lineItemId}
        >
          <Button bsStyle="primary" onClick={onHide}>
            Close
          </Button>
        </Track>
      </Modal.Footer>
    </Modal>
  )
}

export default CommentModal
