import React from "react"
import { connect } from "react-redux"
import Button from "react-bootstrap/lib/Button"
import Select from "react-select"
import {
  getReports,
  getReportParams,
  postGenerateReport,
} from "../../../utils/reporting-client"
import {
  FilterParamsProvider,
  useFilterParamsState,
  useFilterParamsDispatch,
} from "./FilterParamsContext"
import {
  AccountId,
  AccountSiteId,
  AccountSiteIds,
  AccountSiteResourceId,
  BeginRange,
  EndRange,
  ResourceTypeId,
  MasterContractId,
  ServiceContractId,
} from "./params"

import {Modal} from "antd";

import ToastHelper from "../../../utils/ToastHelper"

const PARAM_COMPONENTS = {
  AccountId,
  AccountSiteId,
  AccountSiteIds,
  AccountSiteResourceId,
  ResourceTypeId,
  MasterContractId,
  ServiceContractId,
  BeginRange,
  EndRange,
}

const getState = state => ({
  accountId: state.userAccounts.accountId,
  userAccountId: state.userAccounts.userAccountId,  
})

function ReportingBase({ accountId, userAccountId, visible, onHide }) {
  const state = useFilterParamsState()
  const dispatch = useFilterParamsDispatch()
  const [loading, setLoading] = React.useState(true)
  const [posting, setPosting] = React.useState(false)
  const [reportData, setReportData] = React.useState([])
  const [reportParamsData, setReportParamsData] = React.useState([])
  const [report, setReport] = React.useState(null)

  React.useEffect(() => {
    async function getReportData() {
      const result = await getReports()
      setReportData(result)
      setLoading(false)
    }

    getReportData();

    return function cleanup(){
      dispatch({ type: "reset" });
    } 
  }, [])

  React.useEffect(() => {
    async function onVisibleChange() {
      if(visible === true) return;   
      dispatch({ type: "reset" });   
    }

    onVisibleChange();
  }, [visible])

  React.useEffect(() => {
    async function getReportParamsData(reportModelId) {
      const result = await getReportParams(reportModelId)
      const payload = { names: {} }
      result.map(param => {
        payload[param.name] = null
        payload[param.reportFilterParameterId] = false
        payload.names[param.name] = param.reportFilterParameterId
        return null
      })

      const params = result.map(x => x.name)

      dispatch({ type: "init", payload })
      dispatch({ type: "initialValues", payload: params })
      setReportParamsData(result)
    }

    if (report !== null) {
      getReportParamsData(report.value)
    }   
  }, [report, dispatch])

  function onSelectReport(report) {
    setReportParamsData([])
    setReport(report)
  }

  async function requestReport() {
    setPosting(true)

    const parameters = reportParamsData.map(item => {
      const { reportFilterParameterId } = item
      const value = state[item.name]
      return { reportFilterParameterId, value }
    })

    const result = await postGenerateReport({
      userAccountId,
      reportModelId: report.value,
      parameters,
    })

    var isReportRequested = isNaN(result) === false;
    if (!isReportRequested) {
      ToastHelper.error("An error occurred while requesting your report.")
    } else {
      ToastHelper.success(
        "Your report was successfully requested.",
      )
    }

    // reset everything
    setPosting(false)
    setReport(null)
    setReportParamsData([]);
    onHide(result);    
  }

  function reset(){          
    setReport(null)
    setReportParamsData([])
    onHide(null);    
  }
  const reportOptions = reportData.map(item => {
    return { label: item.name, value: item.reportModelId }
  })

  const requiredParamIds = reportParamsData.map(x => x.reportFilterParameterId)
  let validParams = true
  requiredParamIds.forEach(id => {
    validParams = validParams && state[id]
  })

  return (
    <Modal title="Reporting" maskClosable={false} visible={visible} footer={null} width={'600px'} onCancel={reset}>
        <div>
          <div className="selector">           
            <div className="mb-sm">
              <Select
                name="report"
                options={reportOptions}
                onChange={onSelectReport}
                value={report}
                placeholder={loading ? "Loading..." : "Select report..."}
                isLoading={loading}
                disabled={loading}
              />
            </div>
            {reportParamsData.map(x => {
              const ParamComponent = PARAM_COMPONENTS[x.name]

              return <ParamComponent key={x.reportFilterParameterId} {...x} />
            })}
            <Button
              bsStyle="primary"
              className="btn-block"
              onClick={requestReport}
              disabled={
                posting || !validParams || reportParamsData.length === 0
              }
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
  )
}

const ReportGenerator = ({ userAccountId, accountId, visible, onHide }) => (
  <FilterParamsProvider>
    <ReportingBase accountId={accountId} userAccountId={userAccountId} visible={visible} onHide={onHide} />
  </FilterParamsProvider>
)

export default connect(getState)(ReportGenerator)
