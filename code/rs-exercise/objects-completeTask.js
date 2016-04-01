// mark a task compeleted
function completeTask(elm, id) {
  var rtn, check;
  
  check = data({name:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", 
      "No record on file", 404);
  }
  else {
    check.completed="true";
    data({name:elm, action:'update', id:id, item:check});
  }
  return rtn;
}

