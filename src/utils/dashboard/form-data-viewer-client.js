import client from "../api-client";
import {
  CUSTOMER_API_ROOT
} from "../../constants/api";

const FORM_DATA_VIEWER_DASHBOARD_ROOT = `${CUSTOMER_API_ROOT}api/dashboard/form-data-viewer`;

export default class FormDataViewerClient{
  
  static getSites() {
      return client(`${FORM_DATA_VIEWER_DASHBOARD_ROOT}/sites`)
          .catch(error => Promise.reject(error))
  }

  static getForms(accountSiteId) {
    return client(`${FORM_DATA_VIEWER_DASHBOARD_ROOT}/${accountSiteId}/forms`)
        .catch(error => Promise.reject(error))
  }

  static getServiceForms(accountSiteId, serviceId) {
    return client(`${FORM_DATA_VIEWER_DASHBOARD_ROOT}/${accountSiteId}/services/${serviceId}/forms`)
        .catch(error => Promise.reject(error))
  }

  static getFormMeasurements(accountSiteId, formId) {
    return client(`${FORM_DATA_VIEWER_DASHBOARD_ROOT}/${accountSiteId}/forms/${formId}/measurements`)
        .catch(error => Promise.reject(error))
  }
  static getHistoricalValues(accountSiteId, measurementIds, measurementUid, dateRange) {    
    return client(`${FORM_DATA_VIEWER_DASHBOARD_ROOT}/${accountSiteId}/historical-values`, { body: { measurementUid: measurementUid, measurementIds: measurementIds, dateRange: dateRange} })
        .catch(error => Promise.reject(error))
  }
}

