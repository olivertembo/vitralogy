import React from "react"
import FormGroup from "react-bootstrap/lib/FormGroup"
import FormControl from "react-bootstrap/lib/FormControl"
import Button from "react-bootstrap/lib/Button"
import Input from "../formControls/Input"
import { FMS_PROOF_STATUS } from "../../constants/api"

function InvoiceFilters({ onFiltersChanged, onCloseInvoice, disabled }) {
  const [hasChanged, setHasChanged] = React.useState(false)
  const [filterSite, setFilterSite] = React.useState(null)
  const [filterAuditStatus, setFilterAuditStatus] = React.useState(0)
  const [filterProofStatus, setFilterProofStatus] = React.useState(0)

  const filtersUpdated = () => {
    onFiltersChanged({ filterSite, filterAuditStatus, filterProofStatus })
  }

  React.useEffect(() => {
    if (hasChanged) {
      filtersUpdated()
    }
  }, [filterAuditStatus, filterProofStatus])

  return (
    <div className="row mt-lg invoice-filters">
      <div className="col-md-2">
        <Input
          id="filter-site-name"
          beforeIcon="building"
          placeholder="Filter site name"
          onChange={e => {
            setHasChanged(true)
            setFilterSite(e.target.value)
          }}
          onPressEnter={filtersUpdated}
          value={filterSite}
          tooltip="Press enter to apply site filter"
        />
      </div>
      <div className="col-md-2">
        <FormGroup controlId="filter-audit-status">
          <FormControl
            componentClass="select"
            value={filterAuditStatus}
            onChange={e => {
              setHasChanged(true)
              setFilterAuditStatus(Number(e.target.value))
            }}
          >
            <option value="0">Select audit status...</option>
            <option value="8">Invalid</option>
            <option value="7">Valid</option>
          </FormControl>
        </FormGroup>
      </div>
      <div className="col-md-2">
        <FormGroup controlId="filter-proof-status">
          <FormControl
            componentClass="select"
            value={filterProofStatus}
            onChange={e => {
              setHasChanged(true)
              setFilterProofStatus(Number(e.target.value))
            }}
          >
            <option value="0">Select proof status...</option>
            <option value="-1">Pending Proof</option>
            <option value={FMS_PROOF_STATUS.NO_PROOF_PROVIDED}>
              No Proof Provided
            </option>
            <option value={FMS_PROOF_STATUS.PROOF_PROVIDED}>
              Proof Provided
            </option>
            <option value={FMS_PROOF_STATUS.PROOF_PROVIDED_DONE}>
              Proof Provided. Done
            </option>
          </FormControl>
        </FormGroup>
      </div>
      <div className="col-md-2 col-md-offset-4 text-right">
        <Button onClick={onCloseInvoice} disabled={disabled}>
          Complete Invoice
        </Button>
      </div>
    </div>
  )
}

export default InvoiceFilters
