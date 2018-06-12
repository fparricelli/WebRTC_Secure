function loggedUser() {
  this.name = "";
  this.roleNumber = 0;
  this.token = "";
}

loggedUser.prototype.setName = function(name) {
  this.name = name;
};

loggedUser.prototype.getName = function() {
  return this.name;
};

loggedUser.prototype.setToken = function(token) {
  this.token = token;
};

loggedUser.prototype.getToken = function() {
  return this.token;
};

loggedUser.prototype.setRoleNumber = function(rolen) {
  this.roleNumber = rolen;
};

loggedUser.prototype.getRoleNumber = function() {
  return this.roleNumber;
};

module.exports = loggedUser;