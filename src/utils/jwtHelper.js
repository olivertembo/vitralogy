import decode from "jwt-decode"

export function getTokenExpirationDate(token) {
  const decoded = decode(token)
  if (!decoded.exp) {
    return null
  }

  const date = new Date(0) // The 0 here is the key, which sets the date to the epoch
  date.setUTCSeconds(decoded.exp)
  return date
}

export function isTokenExpired(token) {
  const date = getTokenExpirationDate(token)
  const offsetSeconds = 0
  if (date === null) {
    return false
  }
  return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000)
}

export function parseVitralogyUserAccountId(token) {
  if (token === null) {
    return 0
  }

  const decoded = decode(token)
  if (!decoded) {
    return 0
  }

  return Number(decoded["V-UserAccountID"])
}

export function parseAccountId(token) {
  if (token === null) {
    return 0
  }

  const decoded = decode(token)
  if (!decoded) {
    return 0
  }

  return Number(decoded["V-AccountID"])
}

export function parseName(token) {
  if (token === null) {
    return ""
  }

  const decoded = decode(token)
  if (!decode) {
    return ""
  }

  return decoded["nameid"]
}
