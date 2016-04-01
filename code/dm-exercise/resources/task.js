/*******************************************************
 * task service implementation 
 * resource connector (server)
 * DIRECT DATA CONNECTION
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles HTTP resource operations (per resource)

var root = '';

//these are the fields associated w/ this resource
var props =  ["id","title","completed"];

var qs = require('querystring');
var utils = require('./../utils.js');
var data = require('./../data.js');

module.exports = main;

function main(req, res, parts, respond) {
  var sw;

  // peek first URL arg
  sw = parts[0]||"*";

  switch (req.method) {
    case 'GET':
      switch(sw[0]) {
        case '?':
          sendList(req, res, respond, utils.getQArgs(req));
          break;
        case "*":
          sendList(req, res, respond);
          break;
        default:
          sendItem(req, res, sw, respond);
          break;
      }
      break;
    case 'POST':
      if(sw[0]==="*") {
        addItem(req, res, respond);
      }
      else {
        respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
      }
      break;
    case 'PUT':
      if(sw[0]!=="*") {
        updateItem(req, res, respond, parts[0]);
      }
      else {
        respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
      }
      break;
    case 'DELETE':
      // insert an if-else that calls to removeItem
    default:
      respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
      break;
  }
}

// add a new item to the collection
function addItem(req, res, respond) {
  var body, doc, msg;

  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      data({name:'task',action:'add',item:msg});
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, {code:303, doc:"", 
        headers:{'location':'//'+req.headers.host+"/"}
      });
    } 
    else {
      respond(req, res, doc);
    }
  });
}

// handle update operation
function updateItem(req, res, respond, id) {
  var body, doc, msg;

  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      data({name:'task',action:'update',id:id,item:msg});
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, 
        {code:303, doc:"", headers:{'location':'//'+req.headers.host+"/"}}
      );
    } 
    else {
      respond(req, res, doc);
    }
  })
}

// handle remove operation (no body)
function removeItem(req, res, respond, id) {
  var doc;
  
  // execute
  try {
    doc = data({name:'task',action:'remove', id:id});
    if(doc && doc.type==='error') {
      doc = utils.errorResponse(req, res, doc.message, doc.code);    
    }
  } 
  catch (ex) {
    doc = utils.errorResponse(req, res, 'Server Error', 500);
  }
  
  if (!doc) {
    respond(req, res, 
      {code:303, doc:"", headers:{'location':'//'+req.headers.host+"/"}}
    );
  } 
  else {
    respond(req, res, doc);
  }
}

// return a list of items
function sendList(req, res, respond, filter) {
  var doc, list;

  // get data
  if(filter) {
    list = data({name:'task',action:'filter', filter:filter}); 
  }
  else {
    list = data({name:'task',action:'list'}); 
  }
  
  
  // compose graph 
  doc = {};
  doc.title = "Hyper-Tasks";
  doc.data =  list;

  // send the graph
  respond(req, res, {
    code: 200,
    doc: {
      task: doc
    }
  });
}

// return a single item
function sendItem(req, res, id, respond) {
  var list, doc, rtn;

  list = data({name:'task',action:'item',id:id}); 
  if (!list || (Array.isArray(list) && list.length===0)) {
    rtn = utils.errorResponse(req, res, 'File Not Found', 404);
  }
  else {
    
    // compose graph
    doc = {};
    doc.title = "Hyper-Tasks";
    doc.data = list;
    rtn = {
      code: 200,
      doc: {
        task: doc
      }
    }
  }
  // send graph
  respond(req, res, rtn);
}

// fields to display 
function parseItem(item, props, root) {
  var i, x, rtn;
  
  rtn = {};
  rtn.meta = {};
  rtn.meta.rel = ["item"];
  rtn.meta.href = root + "/" + item.id;
  for(i=0,x=props.length;i<x;i++) {
    rtn[props[i]] = item[props[i]];
  }
  return rtn;
}

// EOF

