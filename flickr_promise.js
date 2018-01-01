const Flickr = require('flickrapi');
const promisify = require('./promisify').promisify;
const tokens = require('./flickr_tokens').tokens;

const flickrOptions = {
    ...tokens,
    permissions: "write"
};

const authFlickr = promisify(Flickr.authenticate, Flickr)(flickrOptions).then(flickr => {
    console.log('connected.');
    return flickr;
});

module.exports.call = async function (name, options) {
    const flickr = await authFlickr;
    const apiParts = name.split('.');
    let obj = flickr;
    while (apiParts.length > 1) {
        obj = obj[apiParts.shift()];
    }
    const funcName = apiParts[0];
    return promisify(obj[funcName], obj)({...flickrOptions, ...options});
}