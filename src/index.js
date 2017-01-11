import "react-app-polyfill/ie11"
import "babel-polyfill"
import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"
import ReactGA from "react-ga"
import registerServiceWorker from "./registerServiceWorker"
import App from "./components/App"
import { APP_GA_TRACKER } from "./constants/api"

import "react-dates/initialize"
import "react-mde/lib/styles/css/react-mde-all.css"
import "froala-editor/js/froala_editor.pkgd.min.js"
import "froala-editor/css/froala_style.min.css"
import "froala-editor/css/froala_editor.pkgd.min.css"
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css"
import "react-s-alert/dist/s-alert-default.css"
import "react-dates/lib/css/_datepicker.css"
import "react-virtualized/styles.css"
import "./assets/css/animate.min.css"
import "./assets/css/pe-icon-7-stroke.css"
// !! IMPORTANT !! The following styles.css import must be last
import "./styles/styles.css"

window.jQuery = window.$ = $

ReactGA.initialize(APP_GA_TRACKER, {
  debug: process.env.NODE_ENV !== "production",
})

// App is loaded, dismiss please-wait splash screen
window.loading_screen.finish()

ReactDOM.render(<App />, document.getElementById("root"))
registerServiceWorker()
