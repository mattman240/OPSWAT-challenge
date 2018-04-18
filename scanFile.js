const API_KEY = require('./OPSWAT_API_KEY.js');
const http = require('https');
const md5Hash = require('md5');
const fs = require('fs');
const request = require('request');
const path = require('path');

const hashFile = (file) => {
  const fileHash = md5Hash(file);
  return fileHash.toUpperCase();
};

const formatData = (res) => {
  console.log('i am res', res);
  const output = [
    `filename: ${res.file_info.display_name}`,
    `overall_status: ${res.scan_results.scan_all_result_a}`,
  ];
  Object.keys(res.scan_results.scan_details).forEach((key) => {
    const value = res.scan_results.scan_details[key];
    const data = [
      `engine: ${key}`,
      `thread_found: ${value.threat_found}`,
      `scan_result: ${value.scan_result_i}`,
      `def_time: ${value.def_time}`,
    ];
    console.log(output[0], '\n', output[1]);
    data.forEach((index) => {
      console.log(index);
    });
  });
};


const addFile = (filePath) => {
  const formData = {
    file: fs.createReadStream(path.join(__dirname, filePath)),
  };
  const headers = {
    url: 'https://api.metadefender.com/v2/file',
    formData,
    headers: { apikey: API_KEY },
  };
  request.post(headers, (err, response, body) => {
    if (err) return console.error('failed to upload, with code', err);
    if (body === '') {
      return console.log('there is no response from server');
    }
    const parameters = {
      method: 'GET',
      hostname: 'api.metadefender.com',
      port: null,
      path: `/v2/file/${JSON.parse(body).data_id}`,
      headers: { apikey: API_KEY },
    };
    const postRequest = http.request(parameters, (res) => {
      const rawData = [];
      res.on('error', error => console.error(error));
      res.on('data', chunkedData => rawData.push(chunkedData));
      res.on('end', () => {
        formatData(JSON.parse(Buffer.concat(rawData).toString()));
      });
    });
    postRequest.end();
  });
};

const apiRequest = (hashCode, filePath) => {
  const parameters = {
    method: 'GET',
    hostname: 'api.metadefender.com',
    path: `/v2/hash/${hashCode}`,
    headers: { apikey: API_KEY },
  };
  const getRequest = http.request(parameters, (res) => {
    const rawData = [];
    res.on('error', error => console.error(error));
    res.on('data', chunkedData => rawData.push(chunkedData));
    res.on('end', () => {
      const result = JSON.parse(Buffer.concat(rawData).toString());
      // console.log(result)
      if (Object.keys(result).length === 1) {
        console.log('uploading file');
        addFile(filePath);
      } else {
        formatData(result);
      }
    });
  });
  getRequest.end();
};

// example post request
// apiRequest(hashFile('samplefile.txt'), 'samplefile.txt');

// example get request
// apiRequest('6A5C19D9FFE8804586E8F4C0DFCC66DE');
