/*******************************************************
 * task service implementation
 * WSTL representor format (server)
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// WSTL representor
module.exports = wstl;

function wstl(object) {

  // emit the full internal representor graph
  return JSON.stringify(object, null, 2);
}

// EOF

