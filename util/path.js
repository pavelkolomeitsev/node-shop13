const path = require('path');

// process.mainModule.filename - a path where our app is running
module.exports = path.dirname(process.mainModule.filename);