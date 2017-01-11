import React, { useState, useEffect } from "react"
import { camelizeKeys } from "humps"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts"
import { SNOW_INVOICE_STATUS_SUMMARY } from "../../constants/api"
import Table from "react-bootstrap/lib/Table"

const COLORS = [
  "#3c783c",
  "#f0ad4e",
  // "#f8D143",
  "#5cb85c",
  "#62c462",
  "#4f9e4f",
]

const OVERALL_COLORS = ["#3c783c", "#d9534f"]

const renderActiveShape = props => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

function InvoiceStats({ auth, invoiceId }) {
  const [stats, setStats] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    function fetchStats() {
      auth
        .request("get", SNOW_INVOICE_STATUS_SUMMARY(invoiceId))
        .then(
          response => {
            const json = camelizeKeys(response.body)
            if (json.isSuccess === true) {
              setStats(json.sites)
            } else {
              setError(json.msg)
            }
          },
          () => setError("Error retrieving invoice summary statistics."),
        )
        .then(() => setIsLoading(false))
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <div>Loading stats..</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  const total = stats.map(x => x.total).reduce((total, num) => total + num)
  const approved = stats
    .map(x => x.approvedCount)
    .reduce((total, num) => total + num)
  const pendingReview = stats
    .map(x => x.pendingReviewCount)
    .reduce((total, num) => total + num)
  const notApproved = stats
    .map(x => x.notApprovedCount)
    .reduce((total, num) => total + num)
  const additionalProofNeeded = stats
    .map(x => x.additionalProofNeededCount)
    .reduce((total, num) => total + num)

  const data = [
    { name: "Approved", value: approved },
    { name: "Pending Review", value: pendingReview },
    { name: "Rejected", value: notApproved },
    { name: "Additional Proof Needed", value: additionalProofNeeded },
  ]

  const invalidCount = pendingReview
  const validCount = approved + notApproved + additionalProofNeeded

  const overallData = [
    { name: "Valid", value: validCount },
    { name: "Action Required", value: invalidCount },
  ]

  const onPieEnter = (data, index) => setActiveIndex(index)

  return (
    <div className="row invoice-stats">
      <div className="col-md-6">
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              {/* details outside pie chart */}
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                innerRadius={120}
                outerRadius={150}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`inside-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              {/* inside total pie chart */}
              <Pie data={overallData} outerRadius={105} dataKey="value">
                {overallData.map((entry, index) => (
                  <Cell
                    key={`overall-cell-${index}`}
                    fill={OVERALL_COLORS[index % OVERALL_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="col-md-6" style={{ height: 400 }}>
        <div className="flex-column flex-center" style={{ height: "100%" }}>
          <Table striped hover>
            <tbody>
              {data.map((x, index) => (
                <tr
                  key={`stat-row-${index}`}
                  onMouseEnter={e => {
                    setActiveIndex(index)
                  }}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <td
                    style={{
                      borderLeft: `solid 6px ${COLORS[index % COLORS.length]}`,
                    }}
                  >
                    {x.name}
                  </td>
                  <td>{x.value}</td>
                </tr>
              ))}
              <tr>
                <td>Total</td>
                <td>{total}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default InvoiceStats
