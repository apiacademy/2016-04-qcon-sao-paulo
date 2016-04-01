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

