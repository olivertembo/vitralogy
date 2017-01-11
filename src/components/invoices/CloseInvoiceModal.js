import React, { useEffect, useState } from "react"
import { camelizeKeys } from "humps"
import ReactGA from "react-ga"
import Modal from "react-bootstrap/lib/Modal"
import Alert from "react-bootstrap/lib/Alert"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import * as api from "../../constants/api"
import InvoiceStats from "./InvoiceStats"
import { Track } from "../analytics"

function CloseInvoiceModal({ auth, invoiceId, serial, show, onHide, title }) {
  const [isClosed, setIsClosed] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    ReactGA.modalview(`/invoices/close/${invoiceId}`)
  }, [])

  const handleClose = () => {
    setIsPosting(true)

    auth
      .request("post", api.POST_CLOSE_INVOICE(invoiceId))
      .query({ serial })
      .query({ statusId: api.FMS_INVOICE_STATUS.CUSTOMER_CONFIRMED })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            setIsClosed(true)
          } else {
            setError(json.msg)
          }
        },
        () => {
          setError("Unable to check for invoice completion.")
        },
      )
      .then(() => {
        setIsPosting(false)
        setChecked(true)
        // onHide(success, msg)
      })
  }

  const alert = isClosed ? (
    <Alert bsStyle="success" className="mb-lg">
      Invoice completed successfully.
    </Alert>
  ) : (
    <Alert bsStyle="danger" className="mb-lg">
      <strong>Unable to complete invoice:</strong> {error}
    </Alert>
  )

  return (
    <Modal
      backdrop="static"
      show={show}
      onHide={() => {
        onHide(isClosed, error)
      }}
      bsSize="large"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {checked && alert}
        <InvoiceStats auth={auth} invoiceId={invoiceId} />
      </Modal.Body>
      <Modal.Footer>
        <div className="pull-right">
          {isClosed === false && (
            <>
              <Button
                bsSize="small"
                disabled={isPosting}
                onClick={() => onHide(isClosed, error)}
              >
                Cancel
              </Button>
              <Track
                category="Invoices"
                action="Close Invoice"
                value={invoiceId}
              >
                <Button
                  bsSize="small"
                  bsStyle="primary"
                  disabled={isPosting || isClosed}
                  onClick={handleClose}
                >
                  {isPosting ? (
                    <span>
                      <Icon name="spinner" spin /> Closing...
                    </span>
                  ) : (
                    "Complete"
                  )}
                </Button>
              </Track>
            </>
          )}
          {isClosed === true && (
            <Button
              bsSize="small"
              disabled={isPosting}
              onClick={() => onHide(isClosed, error)}
            >
              Close
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default CloseInvoiceModal
