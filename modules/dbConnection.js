
// ----- PULL IN MODULE

const monk = require('monk');

// ----- GET DB CONNECTION

module.exports = monk(`${process.env.dbUser}:${process.env.dbPass}@${process.env.dbHost}:${process.env.dbPort}/${process.env.dbName}`);
