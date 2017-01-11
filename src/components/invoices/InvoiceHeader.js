import React from "react"
import Breadcrumb from "react-bootstrap/lib/Breadcrumb"

function InvoiceHeader({ data }) {
  const { vendor, service, invoiceNumber } = data
  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/invoices">Invoices</Breadcrumb.Item>
      <Breadcrumb.Item active>
        {vendor}, {service}, {invoiceNumber}
      </Breadcrumb.Item>
    </Breadcrumb>
  )
}

export default InvoiceHeader
