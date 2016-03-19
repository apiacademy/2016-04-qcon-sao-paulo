/*******************************************************
 * task service implementation
 * business object(s) (server)
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// matches data calls w/ middleware domain-specific verbs

// access stored data
var data = require('./data.js');

/* handle task/todo business objects
  
  args:
    action : list, read, filter, etc.
    filter : name/value pairs for filtering
    item   : actual object to write
    id     : object's storage id
*/
exports.task = function(args) {
  var name, props, rtn;
  var action, id, filter, item;
  
  // parse args
  action = args.action||"";
  filter = args.filter||undefined;
  item = args.item||undefined;
  id = args.id||undefined;

  // valid fields for this record   
  props = ["id","title","completed","dateCreated","dateUpdated"];

  name = 'task';
  rtn = null;

  switch (action) {
    case 'list':
      rtn = getList(data({name:name, action:'list'}));
      break;
    case 'read':
      rtn = getList(data({name:name, action:'item', id:id}));
      break;
    case 'filter':
      rtn = getList(data({name:name, action:'filter', filter:filter}));
      break;
    case 'add':
      rtn = addTask(name, item, props);
      break;
    case 'update':
      rtn = updateTask(name, id, item, props);
      break;
    case 'remove':
      rtm = removeTask(name, id);
      break;
    default:
      rtn = null;
  }
  return rtn;
}

// create a new task object
function addTask(elm, task, props) {
  var rtn, item;
  
  item = {}
  item.title = (task.title||"");
  item.completed = (task.completed||"false");
  
  if(item.completed!=="false" && item.completed!=="true") {
    item.completed="false";
  }
  if(item.title === "") {
    rtn = utils.exception("Missing Title");
  } 
  else {
    data({name:elm, action:'add', item:setProps(item, props)});
  }
  
  return rtn;
}

// update an existing task object
function updateTask(elm, id, task, props) {
  var rtn, check, item;
  
  check = data({name:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    item.id = id;      
    item.title = (task.title===undefined?check.title:task.title);
    item.completed = (task.completed===undefined?check.completed:task.completed);
    
    if(item.completed!=="false" && item.completed!=="true") {
      item.completed="false";
    }
    if (item.title === "") {
      rtn = utils.exception("Missing Title");
    } 
    else {
      data({name:elm, action:'update', id:id, item:setProps(item, props)});
    }
  }
  
  return rtn;
}

// remove a task object from collection
function removeTask(elm, id) {
  var rtn, check;
  
  check = data({name:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    data({name:elm, action:'remove', id:id});
  }
  
  return rtn;  
}

// produce clean array of items
function getList(elm) {
  var coll;

  coll = [];
  if(Array.isArray(elm) === true) {
    coll = elm;
  }
  else {
    if(elm!==null) {
      coll.push(elm);
    }
  }

  return coll;
}

// only write 'known' properties for an item
function setProps(item, props) {
  var rtn, i, x, p;
    
  rtn = {};  
  for(i=0,x=props.length;i<x;i++) {
    p = props[i];
    rtn[p] = (item[p]||"");
  }
  return rtn;
}

// EOF

