const API_KEY = require('./OPSWAT_API_KEY.js');
const http = require('https');
const md5Hash = require('md5');
const fs = require('fs');
const request = require('request');

const hashFile = file => md5Hash(file);

const formatData = (res) => {
  const output = [
    `filename: ${res.file_info.display_name}`,
    `overall_status: ${res.scan_results.scan_all_result_a}`,
  ];
  Object.keys(res.scan_results.scan_details).forEach((key) => {
    const value = res.scan_results.scan_details[key];
    const data = [
      `engine: ${key}`,
      `threat_found: ${value.threat_found}`,
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
  const data = {
    file: fs.createReadStream(filePath),
  };
  const headers = {
    url: 'https://api.metadefender.com/v2/file',
    data,
    headers: { apikey: API_KEY },
  };

  request.post(headers, (err, response, body) => {
    if (err) return console.error('failed to upload, with code', err);
    if (body === '') {
      return console.log('File upload didn\'t work please try again and check the file');
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

const apiRequest = (hashCode) => {
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
      if (!result.scan_results) {
        console.log('uploading file');
        addFile();
      } else {
        formatData(result);
      }
    });
  });
  getRequest.end();
};
