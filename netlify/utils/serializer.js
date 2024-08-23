function serializeQueryParams(params) {
  const queryString = []
  for (const [param, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryString.push(`${encodeURIComponent(param)}=${encodeURIComponent(value)}`)
    }
  }
  return queryString.join('&')
}

module.exports.serializeQueryParams = serializeQueryParams;