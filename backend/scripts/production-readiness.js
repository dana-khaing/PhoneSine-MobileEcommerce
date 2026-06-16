#!/usr/bin/env node
require("dotenv").config();
const { checkProductionReadiness } = require("../src/productionReadiness");

const result = checkProductionReadiness();
console.log(JSON.stringify({
  ready: result.ready,
  blockers: result.blockers,
  warnings: result.warnings,
}, null, 2));

if (!result.ready) process.exitCode = 1;
