#!/usr/bin/env node
require("dotenv").config();
const { generateLaunchRunbook } = require("../src/launchRunbook");

process.stdout.write(generateLaunchRunbook());
