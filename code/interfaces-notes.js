/**********************************
 Internal DORR interfaces
 - data layer
 - object layer
 - resource layer
 - representation layer
 **********************************/

// *** DATA LAYER
/* provides simple *synchronous* disk file storage
  args:
    name   : name/folder of storage object
    action : list, filter, etc.
    filter : name/value pairs
    id     : storage id of object
    item   : actual object to store
*/
function main(args) {}

// *** OBJECT LAYER
/* handle business objects  
  args:
    action : list, read, filter, etc.
    filter : name/value pairs for filtering
    item   : actual object to write
    id     : object's storage id
*/
function main(args) {}

// *** RESOURCE LAYER
/* handle HTTP requests
   req     : http incoming request object
   res     : http outgoing response object
   parts[] : array of URL elements
   respond : callback function
*/  
function main(req, res, parts, respond) {}

// *** REPRESENTATION LAYER
/* handles converting WeSTL into response format
   wstl     : WeSTL document
   mimeType : valid HTTP content-type (e.g. text/html)
   root     : HTTP server root (e.g. localhost:8181/)
*/
function main(object, mimeType, root) {}
    



