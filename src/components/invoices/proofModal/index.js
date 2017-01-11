import React from "react"
import { camelizeKeys } from "humps"
import Modal from "react-bootstrap/lib/Modal"
import ReactGA from "react-ga"
import ProofLoader from "./ProofLoader"
import ProofBody from "./ProofBody"
import FinishedForm from "./FinishedForm"
import * as api from "../../../constants/api"
import { ProofContext } from "./ProofContext"

export default class ProofModal extends React.Component {
  state = {
    isLoading: true,
    proofTypes: [],
    proofReqs: [],
  }

  componentDidMount() {
    ReactGA.modalview("/invoices/proof")
    this.getData()
  }

  getData = () => {
    const { invoiceId, lineItemId } = this.props.item
    this.props.auth
      .request("get", api.GET_PROOF_REQS_FOR_LINE_ITEM(invoiceId, lineItemId))
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            const { proofTypes, preferredProofRequirements: proofReqs } = json
            this.setState({ proofTypes, proofReqs })
          } else {
            this.setState({ hasError: json.msg })
          }
        },
        () => {
          //error
        },
      )
      .then(() => {
        this.setState({ isLoading: false })
      })
  }

  handleProofSubmitted = () => {
    this.getData()
  }

  render() {
    const { isLoading, proofReqs, proofTypes } = this.state
    const { item, auth } = this.props
    const preferredValid = proofReqs.filter(req => req.isSatisfied).length > 0

    return (
      <ProofContext.Provider
        value={{
          auth,
          disabled: true,
          item,
          options: proofTypes,
          preferredValid,
          reqs: proofReqs,
          onProofSubmitted: this.handleProofSubmitted,
        }}
      >
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.props.onHide}
          dialogClassName="proof-modal"
          bsSize="large"
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{isLoading ? <ProofLoader /> : <ProofBody />}</Modal.Body>
          <Modal.Footer>
            <FinishedForm onHide={this.props.onHide} />
          </Modal.Footer>
        </Modal>
      </ProofContext.Provider>
    )
  }
}
