'use strict'

module.exports = flagType

function flagType(flag) {
  if (Array.isArray(flag.type)) {
    return flagType({
      ...flag
    , ...unnest(flag)
    , multi: true
    })
  }
  if (flag.type === Boolean) return 'confirm'
  if (flag.type === Number) return 'number'
  if (flag.mask) return 'password'
  if (flag.choices) {
    if (flag.multi) return 'checkbox'
    return 'list'
  }

  return 'input'
}

function unnest(flag) {
  const types = flag.type.filter((type) => {
    return type !== Array
  })

  return {type: types[0]}
}
