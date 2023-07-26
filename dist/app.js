"use strict";

var _express = _interopRequireDefault(require("express"));
var _path = _interopRequireDefault(require("path"));
var _chalk = _interopRequireDefault(require("chalk"));
var _env = _interopRequireDefault(require("./config/env"));
var _database = _interopRequireDefault(require("./loaders/database"));
var _express2 = _interopRequireDefault(require("./loaders/express"));
var _routesLoader = _interopRequireDefault(require("./loaders/routesLoader"));
var _errorHandler = _interopRequireDefault(require("./routes/middleware/errorHandler"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// Correct import statement for your custom 'loadExpress' function

var app = (0, _express2["default"])();
app.use(_express["default"]["static"](_path["default"].join(__dirname, 'public')));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
// Set mongodb connection.
(0, _database["default"])();
app.use('/api', _routesLoader["default"]);
app.use(_errorHandler["default"]);
var port = _env["default"].PORT;
app.listen(port, function () {
  console.log(_chalk["default"].green.inverse("Server running in ".concat(_env["default"].NODE_ENV, " environment.")));
  console.log(_chalk["default"].blue.inverse("Server running on port ".concat(port, ".")));
});
