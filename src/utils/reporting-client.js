import client from "./api-client"

import {
  REPORTING_BASE,
  GET_REPORTS,
  GET_REPORT_PARAMS,
  POST_GENERATE_REPORT,
  POST_REPORT_PARAM_METADATA
} from "../constants/api"

function getReports() {
  return client(GET_REPORTS).catch(error => Promise.reject(error))
}

function getReportParams(reportModelId) {
  return client(GET_REPORT_PARAMS(reportModelId)).catch(error =>
    Promise.reject(error),
  )
}

function postGenerateReport({ userAccountId, reportModelId, parameters }) {
  return client(POST_GENERATE_REPORT, {
    body: {
      userAccountId,
      reportModelId,
      parameters,
    },
  }).catch(error => Promise.reject(error))
}

function postReportParamsMetadata(body) {
  return client(POST_REPORT_PARAM_METADATA, { body }).catch(error =>
    Promise.reject(error),
  )
}


export {
  getReports,
  getReportParams,
  postGenerateReport,
  postReportParamsMetadata,
}


export class ReportsClient{
  static getPagedRequests(filter) {
    return client(`${REPORTING_BASE}/paged-report-requests`, { body: filter })
      .catch(error =>Promise.reject(error))
  }
  static getRequestReports(id) {
    return client(`${REPORTING_BASE}/reports/${id}`)
      .catch(error =>Promise.reject(error))
  }
  static sendReportToWorkEmail(id, reportIds) {
    return client(`${REPORTING_BASE}/email-me/${id}`, {body: reportIds})
      .catch(error =>Promise.reject(error))
  }

  static shareReport(id, data) {
    return client(`${REPORTING_BASE}/share/${id}`, {body: data})
      .catch(error =>Promise.reject(error))
  }

  static downloadReport(id) {
    return client(`${REPORTING_BASE}/download/${id}`, {requestType: 'blob'})
      .catch(error =>Promise.reject(error))
  }

  static getUserWorkEmail() {
    return client(`${REPORTING_BASE}/work-email`)
      .catch(error =>Promise.reject(error))
  }

  static getIsReportRequestReady(id) {
    return client(`${REPORTING_BASE}/report-request/${id}/ready-state`)
      .catch(error =>Promise.reject(error))
  }  
}