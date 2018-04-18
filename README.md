# OPSWAT-challenge
Coding challenge for OPSWAT

### Getting started
  1. npm install
  2. fill out api key in example file and change the name to OPSWAT_API_KEY.js

### To check if a file has already been scanned
  - apiRequest(hashFile('actual file path'))

### To check a file when you already have the hash
  - apiRequest('hash code in MD5, SHA1, or SHA256')

### To scan a file for the first time
  - addFile('actual file path')
