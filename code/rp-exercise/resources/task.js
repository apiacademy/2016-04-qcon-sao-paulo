/*******************************************************
 * task service implementation
 * resource connector (server)
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
var objects = require('./../objects.js');
var wstl = require('./../wstl.js');

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
          switch(sw) {
            case "completed":
              //sendCompleted(req, res, parts[1], respond);
              respond(req, res, 
                utils.errorResponse(req, res, 'Resouce Not Found', 404));
              break;
            case "incomplete":
              //sendIncomplete(req, res, parts[1], respond);
              respond(req, res, 
                utils.errorResponse(req, res, 'Resouce Not Found', 404));
              break;
            default:
              sendItem(req, res, sw, respond);
          }
          break;
      }
      break;
    case 'POST':
      switch(sw) {
        case "*":
          addItem(req, res, respond);
          break;
        case "completed":
          completeItem(req, res, respond);
          break;
        case "incomplete":
          incompleteItem(req, res, respond);
          break;
        default:
          respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
          break;
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
      if(sw[0]!=="*") {
        removeItem(req, res, respond, parts[0]);
      }
      else {
        respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
      }
      break;
    default:
      respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
      break;
  }
}

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
      doc = objects.task({action:'add', item:msg});
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
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
      doc = objects.task({action:'update', id:id, item:msg});
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
  })
}

// handle remove operation (no body)
function removeItem(req, res, respond, id) {
  var doc;
  
  // execute
  try {
    doc = objects.task({action:'remove', id:id});
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

// handle complete operation
function completeItem(req, res, respond) {
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
      doc = objects.task({action:'complete', id:msg.id});
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
  })
}

// handle incomplete operation
function incompleteItem(req, res, respond) {
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
      doc = objects.task({action:'incomplete', id:msg.id});
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
  })
}

function sendList(req, res, respond, filter) {
  var doc, coll, tran, root, list, items, i, x;

  root = '//'+req.headers.host;
  
  // get data
  if(filter) {
    list = objects.task({action:'filter',filter:filter});
  }
  else {
    list = objects.task({action:'list'});
  }
  
  // update items (fields & links)
  items = [];
  for(i=0,x=list.length;i<x;i++) {
    items.push(parseItem(list[i], props, root));
  }
  
  // build up transitions
  coll = [];

  tran = wstl("selfLink");
  tran.href = root +"/"; 
  tran.rel = ["self"];
  coll.splice(coll.length, 0, tran);

  tran  = wstl("listAll");
  tran.href = root + "/";
  tran.rel = ["collection"];
  coll.splice(coll.length, 0, tran);
  
  tran = wstl("listActive");
  tran.href = root + "/"
  tran.rel =["active","collection"];
  coll.splice(coll.length, 0, tran);

  tran = wstl("listCompleted");
  tran.href = root + "/"
  tran.rel = ["completed","collection"];
  coll.splice(coll.length, 0, tran);
  
  tran = wstl("addForm");
  tran.href = root + "/";
  tran.rel = ["create-form"];
  coll.splice(coll.length, 0, tran);

  tran = wstl("searchForm");
  tran.href = root + "/";
  tran.rel = ["search"];
  coll.splice(coll.length, 0, tran);
  
  // compose graph 
  doc = {};
  doc.title = "Hyper-Tasks";
  doc.actions = coll;
  doc.data =  items;

  // send the graph
  respond(req, res, {
    code: 200,
    doc: {
      task: doc
    }
  });
}

function sendItem(req, res, id, respond) {
  var list, doc, trans, root, coll, items, rtn;

  root = '//'+req.headers.host;

  list = objects.task({action:'read', id:id});
  if (!list || (Array.isArray(list) && list.length===0)) {
    rtn = utils.errorResponse(req, res, 'File Not Found', 404);
  }
  else {

    // clean up a single item
    items = [];
    items.push(parseItem(list[0], props, root));
    
    // build up transitions
    coll = [];

    tran = wstl("selfLink");
    tran.href = root +"/" + id;
    tran.rel = ["self"];
    coll.splice(coll.length, 0, tran);
    
    tran = wstl("listAll");
    tran.href = root + "/";
    tran.rel = ["collection"];
    coll.splice(coll.length, 0, tran);
  
    tran = wstl("listActive");
    tran.href = root + "/"
    tran.rel = ["active","collection"];
    coll.splice(coll.length, 0, tran);
  
    tran = wstl("listCompleted");
    tran.href = root + "/"
    tran.rel = ["completed","collection"];
    coll.splice(coll.length, 0, tran);

    tran = wstl("editForm");
    tran.href = root + "/" + id;
    tran.rel = ["edit"];
    coll.splice(coll.length, 0, tran);

    tran = wstl("removeForm");
    tran.href = root + "/" + id;
    tran.rel = ["remove"];
    coll.splice(coll.length, 0, tran);
    
    tran = wstl("addForm");
    tran.href = root +"/";
    tran.rel = ["create-form"];
    coll.splice(coll.length, 0, tran);

    tran = wstl("completeLink");
    tran.href = root +"/completed/{id}";
    tran.rel = ["complete-link"];
    coll.splice(coll.length, 0, tran);

    tran = wstl("incompleteLink");
    tran.href = root +"/incomplete/{id}";
    tran.rel = ["incomplete-link"];
    coll.splice(coll.length, 0, tran);
  
    // compose graph
    doc = {};
    doc.title = "Hyper-Tasks";
    doc.actions = coll;
    doc.data = items;
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

function sendCompleted(req, res, id, respond) {
  var list, doc, trans, root, coll, items, rtn;

  root = '//'+req.headers.host;

  list = objects.task({action:'read', id:id});
  if (!list || (Array.isArray(list) && list.length===0)) {
    rtn = utils.errorResponse(req, res, 'File Not Found', 404);
  }
  else {

    // clean up a single item
    items = [];
    items.push(parseItem(list[0], props, root));
    
    // build up transitions
    coll = [];

    tran = wstl("selfLink");
    tran.href = root +"/" + id;
    tran.rel = ["self"];
    coll.splice(coll.length, 0, tran);
    
    tran = wstl("listAll");
    tran.href = root + "/";
    tran.rel = ["collection"];
    coll.splice(coll.length, 0, tran);
  
    tran = wstl("completedForm");
    tran.href = root +"/completed";
    tran.rel = ["complete-form"];
    coll.splice(coll.length, 0, tran);

    // compose graph
    doc = {};
    doc.title = "Hyper-Tasks";
    doc.actions = coll;
    doc.data = items;
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

function sendIncomplete(req, res, id, respond) {
  var list, doc, trans, root, coll, items, rtn;

  root = '//'+req.headers.host;

  list = objects.task({action:'read', id:id});
  if (!list || (Array.isArray(list) && list.length===0)) {
    rtn = utils.errorResponse(req, res, 'File Not Found', 404);
  }
  else {

    // clean up a single item
    items = [];
    items.push(parseItem(list[0], props, root));
    
    // build up transitions
    coll = [];

    tran = wstl("selfLink");
    tran.href = root +"/" + id;
    tran.rel = ["self"];
    coll.splice(coll.length, 0, tran);
    
    tran = wstl("listAll");
    tran.href = root + "/";
    tran.rel = ["collection"];
    coll.splice(coll.length, 0, tran);
  
    tran = wstl("incompleteForm");
    tran.href = root +"/incomplete";
    tran.rel = ["incomplete-form"];
    coll.splice(coll.length, 0, tran);

    // compose graph
    doc = {};
    doc.title = "Hyper-Tasks";
    doc.actions = coll;
    doc.data = items;
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
  // add item link
  rtn.meta = {};
  rtn.meta.rel = ["item"];
  rtn.meta.href = root + "/" + item.id;

  // add properties
  for(i=0,x=props.length;i<x;i++) {
    rtn[props[i]] = item[props[i]];
  }
  return rtn;
}

// EOF

