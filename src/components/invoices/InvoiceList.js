import React from "react"
import { Link } from "react-router-dom"
import { camelizeKeys } from "humps"
import Alert from "react-bootstrap/lib/Alert"
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer"
import { Table } from "react-virtualized/dist/commonjs/Table"
import { Column } from "react-virtualized/dist/commonjs/Table"
import { format } from "../../utils/datetime"
import * as api from "../../constants/api"
import InvoiceLoader from "./InvoiceLoader"
export default class InvoiceList extends React.Component {
  state = {
    isLoading: true,
    invoices: [],
    hasError: null,
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    this.props.auth
      .request("post", api.GET_SNOW_INVOICES)
      .send({ pageNumber: 1, pageSize: 20 })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)

          if (json.isSuccess === true) {
            const { invoices } = json
            this.setState({ invoices })
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

  _rowGetter = index => {
    return this.state.invoices[index]
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return "header-row"
    } else {
      return index % 2 === 0 ? "even-row" : "odd-row"
    }
  }

  render() {
    const { hasError, invoices, isLoading } = this.state
    if (isLoading) {
      return <InvoiceLoader />
    }

    if (hasError) {
      return <div className="invoice-list">error: {hasError}</div>
    }

    if (invoices.length === 0) {
      return (
        <Alert bsStyle="warning" className="mt-lg">
          No invoices were found for your customer account.
        </Alert>
      )
    }

    return (
      <div className="invoice-list">
        <AutoSizer>
          {({ width, height }) => (
            <Table
              headerHeight={50}
              height={height}
              noRowsRenderer={() => <div>No rows</div>}
              rowHeight={50}
              rowClassName={this._rowClassName}
              rowGetter={({ index }) => invoices[index]}
              rowCount={invoices.length}
              width={width}
            >
              <Column
                label="Invoice #"
                dataKey="invoiceNumber"
                width={200}
                cellRenderer={({ cellData, rowData }) => (
                  <Link
                    to={{
                      pathname: `/invoices/${rowData.invoiceId}`,
                      state: {
                        serial: rowData.serial,
                        auditStatusId: rowData.auditStatusId,
                        vendor: rowData.vendor,
                        service: rowData.serviceCategory,
                        invoiceNumber: cellData,
                      },
                    }}
                  >
                    {cellData}
                  </Link>
                )}
              />
              <Column label="Status" dataKey="auditStatus" width={200} />
              <Column
                label="Issued On"
                dataKey="issueDate"
                width={120}
                cellRenderer={({ cellData }) => format(cellData, "MM/DD/YYYY")}
              />
              <Column
                label="Billing Period"
                dataKey="billingPeriod"
                width={120}
              />
              <Column
                label="Service Category"
                dataKey="serviceCategory"
                width={170}
              />
              <Column label="Vendor" dataKey="vendor" width={500} />
            </Table>
          )}
        </AutoSizer>
      </div>
    )
  }
}
