import { createStore, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"
import { initialize, addTranslationForLanguage } from "react-localize-redux"
import rootReducer from "../reducers"

const json = require("../constants/en.json")

export default function configureStore(initialState) {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const isDebuggingInChrome =
    process.env.NODE_ENV !== "production" && !!window.navigator.userAgent

  // const config = {
  //   key: 'root',
  //   storage,
  // }

  // const reducer = persistReducer(config, rootReducer)

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(thunk)),
  )

  // persistStore(store)
  const languages = ["en"]
  store.dispatch(initialize(languages))
  store.dispatch(addTranslationForLanguage(json, "en"))

  // persistStore(store)

  if (isDebuggingInChrome) {
    window.store = store
  }

  return store
}
