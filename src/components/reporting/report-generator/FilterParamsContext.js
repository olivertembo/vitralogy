import React from "react"

const FilterParamsStateContext = React.createContext()
const FilterParamsDispatchContext = React.createContext()

let initialValues = null

function resetChildren(action) {
  const { type, payload } = action

  const findParentIndex = initialValues.findIndex(name => name === type)
  const parentAndChildren = initialValues.slice(findParentIndex)
  const resetFields = {}
  parentAndChildren.forEach(name => {
    if (name === type) {
      resetFields[name] = payload
    } else {
      resetFields[name] = null
    }
  })

  return resetFields
}

function toggleValidFlags(names, action) {
  const result = {}
  const { type, payload } = action
  let foundType = false
  Object.keys(names).forEach(name => {
    const id = names[name]

    // return true for the field we're changing
    if (name === type) {
      result[id] = payload ? true : false
      foundType = true
      return
    }

    // return true for the fields prior to the one we're changing
    // return false for all the children other the changed field
    result[id] = !foundType
  })

  return result
}

function filterParamsReducer(state, action) {
  const { type, payload } = action

  let children = null
  let validFields = null
  if (initialValues) {
    children = resetChildren(action)
    validFields = toggleValidFlags(state.names, action)
  }

  switch (type) {
    case "init":
      return { ...payload }
    case "initialValues":
      initialValues = payload;
      return state;
    case "reset": initialValues = null; return state;
    case "AccountId":
      return { ...state, AccountId: payload, [state.names[type]]: true }
    case "AccountSiteIds":
    case "AccountSiteId":
    case "ResourceTypeId":
    case "AccountSiteResourceId":
    case "MasterContractId":
    case "ServiceContractId":
    case "BeginRange":
    case "EndRange":
      return {
        ...state,
        ...children,
        ...validFields,
      }
    default:
      throw new Error(`filterParamsReducer unhandled action type: ${type}`)
  }
}

function FilterParamsProvider({ children }) {
  const [state, dispatch] = React.useReducer(filterParamsReducer, null)

  return (
    <FilterParamsStateContext.Provider value={state}>
      <FilterParamsDispatchContext.Provider value={dispatch}>
        {children}
      </FilterParamsDispatchContext.Provider>
    </FilterParamsStateContext.Provider>
  )
}

function useFilterParamsState() {
  const context = React.useContext(FilterParamsStateContext)
  if (context === undefined) {
    throw new Error(
      `useFilterParamsState must be used within a FilterParamsProvider`,
    )
  }
  return context
}

function useFilterParamsDispatch() {
  const context = React.useContext(FilterParamsDispatchContext)
  if (context === undefined) {
    throw new Error(
      `useFilterParamsDispatch must be used within a FilterParamsProvider`,
    )
  }
  return context
}

export { FilterParamsProvider, useFilterParamsDispatch, useFilterParamsState }
