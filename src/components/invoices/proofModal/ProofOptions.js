import React from "react"
import Icon from "react-fa/lib/Icon"
import ListGroup from "react-bootstrap/lib/ListGroup"
import classNames from "classnames"
import { ProofContext } from "./ProofContext"

function ProofOptions({ onOptionClick, selectedOptionId }) {
  const proofContext = React.useContext(ProofContext)
  const { options, disabled } = proofContext

  return (
    <div className="proofs-list">
      <ListGroup componentClass="ul">
        {options.map(option => {
          const optionDisabled = disabled && option.uploadedCount === 0

          return (
            <li
              className={classNames(
                "list-group-item",
                { active: selectedOptionId === option.proofTypeId },
                { disabled: optionDisabled },
              )}
              onClick={() => {
                if (!optionDisabled) {
                  onOptionClick(option.proofTypeId)
                }
              }}
              key={option.proofTypeId}
            >
              <div className="row">
                <div className="ml-md mb-sm col-sm-12 proof-item-sidebar">
                  {option.uploadedCount > 0 && (
                    <React.Fragment>
                      <Icon name="check-circle" className="icon-valid" />{" "}
                    </React.Fragment>
                  )}
                  {option.name}{" "}
                  {option.isPreferred && (
                    <span className="meta">(preferred)</span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ListGroup>
    </div>
  )
}

export default ProofOptions
