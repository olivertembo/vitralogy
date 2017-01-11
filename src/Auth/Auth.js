import history from "../history"
import auth0 from "auth0-js"
import request from "superagent"
import { saveAs } from "file-saver"
import { AUTH_CONFIG } from "./auth0-variables"
import { isTokenExpired } from "../utils/jwtHelper"
import ToastHelper from "../utils/ToastHelper"
import * as api from "../constants/api"
import { authTokenReceived, vasTokenReceived } from "../actions/userAccounts"

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    //redirectUri: AUTH_CONFIG.callbackUrl,
    redirectUri: `${window.location.origin}/callback`,
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    responseType: "token id_token",
    scope: "openid",
  })

  constructor(store) {
    this.store = store

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getToken = this.getToken.bind(this)
    this.getVasToken = this.getVasToken.bind(this)
    this.getProfileAccountName = this.getProfileAccountName.bind(this)
    this.getProfileName = this.getProfileName.bind(this)
    this.getRoles = this.getRoles.bind(this)
    // this.setToken = this.setToken.bind(this);
    this.setVasToken = this.setVasToken.bind(this)
    this.setProfile = this.setProfile.bind(this)
    this.setRoles = this.setRoles.bind(this)
    this.request = this.request.bind(this)
    this.loggedIn = this.loggedIn.bind(this)
    this.vitralogyAccess = this.vitralogyAccess.bind(this)
    this.isAdmin = this.isAdmin.bind(this)
    this.isWorker = this.isWorker.bind(this)
  }

  login() {
    this.auth0.authorize()
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        history.replace("/account")
      } else if (err) {
        history.replace("/account")
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime(),
    )
    localStorage.setItem("access_token", authResult.accessToken)
    localStorage.setItem("id_token", authResult.idToken)
    localStorage.setItem("expires_at", expiresAt)
    // navigate to the account route to get the vas token
    history.replace("/account")
  }

  setVasToken(vasToken) {
    localStorage.setItem("vas_token", vasToken)
  }

  setRoles(roles) {
    localStorage.setItem("roles", roles)
  }

  setProfile(accountName, name) {
    const data = {
      accountName,
      name,
    }

    localStorage.setItem("profile", JSON.stringify(data))
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem("access_token")
    localStorage.removeItem("id_token")
    localStorage.removeItem("expires_at")
    localStorage.removeItem("vas_token")
    localStorage.removeItem("roles")

    // navigate to the login route
    history.replace("/login")
  }

  isAuthenticated() {
    //console.log("isAuthenticated");
    // Check whether the current time is past the
    // access token's expiry time
    const token = this.getToken()
    //console.log("isAuthenticated");
    //console.log("token", token);
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"))
    //console.log(expiresAt);
    const tokenValid = new Date().getTime() < expiresAt
    //console.log("tokenValid", tokenValid);

    try {
      if (!!token && tokenValid) {
        this.store.dispatch(authTokenReceived(token))
        this.store.dispatch(vasTokenReceived(this.getVasToken()))
      }

      return tokenValid
    } catch (e) {}

    return false
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const currentToken = this.getToken()

    try {
      const val = !!currentToken && !isTokenExpired(currentToken)
      if (val) {
        const state = this.store.getState()
        const { token, vasToken } = state.userAccounts

        if (token === null) {
          this.store.dispatch(authTokenReceived(currentToken))
        }
        if (vasToken === null) {
          this.store.dispatch(vasTokenReceived(this.getVasToken()))
        }
      }

      return val
    } catch (e) {
      // couldn't reach auth0,
      // supply a better result back to caller
      // to display login error instead of just login form
    }

    return false
  }

  vitralogyAccess() {
    const vasToken = this.getVasToken()
    return !!vasToken && this.isAuthenticated()
  }

  getToken() {
    return localStorage.getItem("id_token")
  }

  getVasToken() {
    return localStorage.getItem("vas_token")
  }

  getRoles() {
    return localStorage.getItem("roles")
  }

  getProfileAccountName() {
    const profile = localStorage.getItem("profile")
    if (profile === null || profile === "undefined") {
      return ""
    }

    return JSON.parse(profile).accountName
  }

  getProfileName() {
    const profile = localStorage.getItem("profile")
    if (profile === null || profile === "undefined") {
      return ""
    }

    return JSON.parse(profile).name
  }

  isAdmin() {
    const roles = this.getRoles()
    return !!roles && roles.indexOf("Customer Admin") > -1
  }

  isWorker() {
    const roles = this.getRoles()
    return !!roles && roles.indexOf("Customer Worker") > -1
  }

  request(method, url) {
    return request(method, url)
      .set(api.AUTH_HEADER_AUTH0, this.getToken())
      .set(api.AUTH_HEADER_VITRALOGY, this.getVasToken())
  }

  downloadFile(url, filename) {
    request("get", url)
      .set(api.AUTH_HEADER_AUTH0, this.getToken())
      .set(api.AUTH_HEADER_VITRALOGY, this.getVasToken())
      .responseType("blob")
      .end((err, resp) => {
        if (resp) {
          if (resp.notFound) {
            ToastHelper.error(
              "File missing on server, contact Vitralogy Support",
            )
          } else if (resp.forbidden) {
            ToastHelper.error("Permission denied, contact Vitralogy Support")
          } else {
            const blob = new Blob([resp.body], { type: resp.type })
            saveAs(blob, filename)
          }
        } else {
          ToastHelper.error(
            "There was a problem attempting to download this file.",
          )
        }
      })
  }

  getBlobData(url, filename) {
    return request("get", url)
      .set(api.AUTH_HEADER_AUTH0, this.getToken())
      .set(api.AUTH_HEADER_VITRALOGY, this.getVasToken())
      .responseType("blob")
      .then(response => {
        if (response.ok) {
          const resp = response
          return resp
        }

        return response.statusText
      })
  }
}
