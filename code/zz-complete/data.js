/*******************************************************
 * task service implementation
 * data storage (server)
 * March 2016
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

var fs = require('fs');
var folder = process.cwd() + '/data/';
var utils = require('./utils.js');

module.exports = main;

/* provides simple *synchronous* disk file storage
  args:
    name   : name/folder of storage object
    action : list, filter, etc.
    filter : name/value pairs
    id     : storage id of object
    item   : actual object to store
*/
function main(args) {
  var rtn, name, filter, id, item;
  
  // parse args
  name = args.name||"";
  action = args.action||"";
  filter = args.filter||undefined;
  id = args.id||undefined;
  item = args.item||undefined;

  switch (action) {
    case 'list':
      rtn = getList(name);
      break;
    case 'filter':
      rtn = getList(name, filter);
      break;
    case 'item':
      rtn = getItem(name, id);
      break;
    case 'add':
      rtn = addItem(name, item, id);
      break;
    case 'update':
      rtn = updateItem(name, id, item);
      break;
    case 'remove':
      rtn = removeItem(name, id);
      break;
    default:
      rtn = null;
      break;
  }
  return rtn;
}

function getList(name, filter) {
  var coll, item, list, i, x, t, field;

  coll = [];
  try {
    list = fs.readdirSync(folder + name + '/');
    for (i = 0, x = list.length; i < x; i++) {
      item = JSON.parse(fs.readFileSync(folder + name + '/' + list[i]));
      if (filter) {
        t = null;
        for (var field in filter) {
          try {
            if (item[field].toString().toLowerCase().indexOf(filter[field].toString().toLowerCase()) !== -1) {
              t = list[i];
            } 
            else {
              t = null;
            }
          } 
          catch (err) {
            t = null;
          }
        }
        if (t !== null) {
          coll.push(item);
        }
      } 
      else {
        coll.push(item);
      }
    }
  } 
  catch (ex) {
    coll = [];
  }

  return coll;
}

function getItem(name, id) {
  var rtn;

  try {
    rtn = JSON.parse(fs.readFileSync(folder + name + '/' + id));
  } 
  catch (ex) {
    rtn = null;
  }

  return rtn;
}

function addItem(name, item, id) {
  var rtn;

  if (id) {
    item.id = id;
  } else {
    item.id = makeId();
  }
  item.dateCreated = new Date();
  item.dateUpdated = item.dateCreated;

  if (fs.existsSync(folder + name + '/' + item.id)) {
    rtn = utils.exception("Task", "Record already exists");
  } 
  else {
    try {
      fs.writeFileSync(folder + name + '/' + item.id, JSON.stringify(item));
      rtn = getItem(name, item.id);
    } 
    catch (ex) {
      rtn = null;
    }
  }
  return rtn;
}

function updateItem(name, id, item) {
  var current, rtn;

  current = getItem(name, id);
  if (!current) {
    rtn = utils.exception("Task", "Invalid [id]", 400);
    return rtn;
  }

  for (var prop in item) {
    current[prop] = item[prop];
  }

  current = item;
  current.dateUpdated = new Date();

  rtn = null;
  try {
    fs.writeFileSync(folder + name + '/' + id, JSON.stringify(current));
    rtn = getItem(name, id);
  } 
  catch (ex) {
    rtn = null;
  }

  return rtn;
}

function removeItem(name, id) {
  var rtn;

  try {
    fs.unlinkSync(folder + name + '/' + id);
    rtn = getList(name);
  } 
  catch (ex) {
    rtn = getList(name);
  }
  return rtn;
}

function makeId() {
  var rtn;

  rtn = String(Math.random());
  rtn = rtn.substring(2);
  rtn = parseInt(rtn).toString(36);

  return rtn;
}

// EOF

