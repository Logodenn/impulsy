module.exports = {
  /**
   * Function formatting errors before sending it to client
   */
  formatErrors: function (errorsIn) {
    let errors = {}

    for (let a = 0; a < errorsIn.length; a++) {
      let e = errorsIn[a]

      errors[e.property] = errors[e.property] || []
      errors[e.property].push(e.msg)
    }

    return errors
  }
}
