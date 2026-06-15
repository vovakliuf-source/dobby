const nodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

console.log(process.env.GEOCODER_PROVIDER, process.env.GEOCODER_API_KEY, '<< here')

const getGeoCoder = nodeGeocoder(options);

module.exports = getGeoCoder;