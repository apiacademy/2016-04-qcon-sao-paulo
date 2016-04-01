// update an existing task object
function updateTask(elm, id, task, props) {
  var rtn, check, item;
  
  check = data({name:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    // object validation
    item = check;
    item.id = id;      
    item.title = 
      (task.title===undefined?check.title:task.title);
    item.completed = 
      (task.completed===undefined?check.completed:task.completed);
    
    if(item.completed!=="false" && item.completed!=="true") {
      item.completed="false";
    }
    if (item.title === "") {
      rtn = utils.exception("Missing Title");
    } 
    else {
      data({name:elm, action:'update', id:id, 
        item:setProps(item, props)}
      );
    }
  }
  
  return rtn;
}

