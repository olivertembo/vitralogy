import React from "react"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import { ProofContext } from "./ProofContext"

function ProofProgressAlert() {
  const proofContext = React.useContext(ProofContext)
  const { options, reqs, preferredValid } = proofContext
  const isStarted = options.filter(x => x.uploadedCount > 0).length > 0

  if (isStarted === false) {
    return null
  }

  if (preferredValid) {
    const comboNames = reqs.filter(req => req.isSatisfied).map(x => x.name)
    const prep = comboNames.length > 1 ? "are" : "is"
    return (
      <Alert bsStyle="success">
        {comboNames.join(", ")} {prep} complete! Check the box below and click
        done.
      </Alert>
    )
  } else {
    const isPreferredOptions = options
      .filter(x => x.isPreferred)
      .map(x => x.proofTypeId)

    const nonPreferredSubmitted = reqs.filter(req =>
      req.proofs.filter(
        x =>
          x.uploadedCount > 0 &&
          isPreferredOptions.indexOf(x.proofTypeId) === -1,
      ),
    )

    const inProgressCombos = reqs.filter(
      req =>
        req.isSatisfied === false &&
        req.proofs.filter(
          x =>
            x.uploadedCount > 0 &&
            isPreferredOptions.indexOf(x.proofTypeId) > -1,
        ).length > 0,
    )

    const alerts = inProgressCombos.map(x => {
      // const provided = x.proofs.filter(p => p.uploadedCount > 0)
      const notProvided = x.proofs
        .filter(p => p.uploadedCount === 0)
        .map(z => z.name)
      return (
        <Alert bsStyle="warning" key={x.preferredProofTypeId}>
          <strong>{x.name}</strong>: Missing {notProvided.join(", ")} to
          complete this method.
        </Alert>
      )
    })

    return (
      <React.Fragment>
        {alerts}
        {nonPreferredSubmitted && (
          <Alert bsStyle="warning">
            <Icon name="info-circle" /> You have submitted non-preferred
            proof(s), although not ideal, they will be included in your
            submission for this line item.
          </Alert>
        )}
      </React.Fragment>
    )
  }
}

export default ProofProgressAlert
