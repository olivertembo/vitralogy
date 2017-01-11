import React from "react"
import InvoiceList from "./InvoiceList"
import { render, waitForElement } from "react-testing-library"
import Request from "superagent"

jest.mock("../../__mocks__/superagent.js")

describe("<InvoiceList />", () => {
  test("Invoice list should render after async API call", async () => {
    Request.__setMockResponse({
      status() {
        return 200
      },
      ok() {
        return true
      },
      body: {
        Invoices: [],
        IsSuccess: true,
      },
    })
    const auth = {
      request: () => Request,
    }

    const { container, getByTitle } = render(<InvoiceList auth={auth} />)

    await waitForElement(() => getByTitle(/invoice #/i))

    jest.restoreAllMocks()
  })
})
