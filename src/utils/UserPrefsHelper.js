/* eslint-disable */
Array.prototype.getPrefByKey = function findPref(key) {
  const pref = this.find(x => x.Key === key)
  if (pref !== undefined) {
    return Object.assign({}, pref)
  }

  return null
}

Array.prototype.getBoolPrefByKey = function findPref(key, defaultValue) {
  const pref = this.find(x => x.Key === key)
  if (pref !== undefined) {
    const strictType = Object.assign({}, pref)
    strictType.Data = strictType.Data === "true"

    return strictType.Data
  }

  return defaultValue
}

Array.prototype.getJsonPrefByKey = function findPref(key, defaultValue) {
  const pref = this.find(x => x.Key === key)
  if (pref !== undefined) {
    const json = Object.assign({}, JSON.parse(pref.Data))

    return json
  }

  return defaultValue
}
