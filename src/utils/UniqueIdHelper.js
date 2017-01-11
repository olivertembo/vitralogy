let lastId = 0

export default function uniqueId(prefix = "id", suffix = "-") {
  lastId++
  return `${prefix}${lastId}${suffix}`
}
