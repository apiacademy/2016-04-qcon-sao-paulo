/*******************************************************
 * task service implementation
 * representation router (server)
 * JSON, Cj, WSTL
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles internal representation routing (based on conneg)

// load representors
var cj = require('./representors/cj.js');
var json = require('./representors/json.js');
var wstl = require('./representors/wstl.js');

module.exports = main;

function main(object, mimeType, root) {
  var doc;

  // clueless? assume Cj
  if (!mimeType) {
    mimeType = "application/vnd.collection+json";
  }

  // dispatch to requested representor
  switch (mimeType.toLowerCase()) {
    case "application/json":
      doc = json(object, root);
      break;
    case "application/vnd.collection+json":
      doc = cj(object, root);
      break;
    case "application/prs.wstl+json":
      doc = wstl(object, root);
      break;
    default:
      doc = wstl(object, root);
      break;
  }

  return doc;
}

// EOF

