/*******************************************************
 * task service implementation
 * representation router (server)
 * JSON-ONLY
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles internal representation routing (based on conneg)

// load representors
var json = require('./representors/json.js');

module.exports = main;

function main(object, mimeType, root) {
  var doc;

  // clueless? assume JSON
  if (!mimeType) {
    mimeType = "application/json";
  }

  // dispatch to requested representor
  switch (mimeType.toLowerCase()) {
    case "application/json":
      doc = json(object, root);
      break;
    default:
      doc = json(object, root);
      break;
  }

  return doc;
}

// EOF

