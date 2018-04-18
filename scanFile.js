const API_KEY = require('./OPSWAT_API_KEY.js');
const $ = require('jquery');
const md5Hash = require('md5');
const fs = require('fs');

const hashFile = file => md5Hash(file);
