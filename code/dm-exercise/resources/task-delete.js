// DELETE code for resource.js
if(sw[0]!=="*") {
  removeItem(req, res, respond, parts[0]);
}
else {
  respond(
    req, 
    res, 
    utils.errorResponse(req, res, 'Method Not Allowed', 405)
  );
}

