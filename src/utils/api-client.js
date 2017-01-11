import { camelizeKeys } from "humps"

function client(endpoint, { body, ...customConfig } = {}) {
  const token = window.localStorage.getItem("id_token")
  const vasToken = window.localStorage.getItem("vas_token")
  const headers = {};
  if(customConfig !== null && customConfig.requestType !== null && customConfig.requestType === "blob")
    headers[ "content-type"] = "application/octet-stream";
  else
    headers[ "content-type"] = "application/json";

  if (token) {
    headers.Authorization = token
  }
  if (vasToken) {
    headers["X-Vitralogy-Authorize"] = vasToken
  }
  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  }
  if (body) {
    config.body = JSON.stringify(body)
  }

  // TODO r.json failing - tokens not set yet?
  var promise = window
    .fetch(endpoint, config);

  if(customConfig !== null && customConfig.requestType !== null && customConfig.requestType === "blob"){
    return promise.then(r => {
      if (!r.ok) {
        throw new Error(r.statusText)
      }
      return r.blob();
    })
  }
  else {
    return promise.then(r => {
      if (!r.ok) {
        throw new Error(r.statusText)
      }
      
      return r.json()
    })
    .then(r => camelizeKeys(r))
  }
}

export default client
