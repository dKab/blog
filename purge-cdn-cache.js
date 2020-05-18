const axios = require('axios');
const fs = require('fs');

const parameters = JSON.parse(process.env.PARAMETERS);
const CLOUDFLARE_X_AUTH_EMAIL = parameters.Parameters
    .find(param => param.Name === 'CLOUDFLARE_X_AUTH_EMAIL').Value;
const CLOUDFLARE_X_AUTH_KEY = parameters.Parameters
    .find(param => param.Name === 'CLOUDFLARE_X_AUTH_KEY').Value;
const CLOUDFLARE_ZONE_ID = parameters.Parameters
    .find(param => param.Name === 'CLOUDFLARE_ZONE_ID').Value;

const urls = fs.readFileSync('urls-to-purge.txt', 'utf8').toString().split('\n');
const headers = {
    'X-Auth-Email': CLOUDFLARE_X_AUTH_EMAIL,
    'X-Auth-Key': CLOUDFLARE_X_AUTH_KEY,
    'Content-Type': 'application/json'
};

if (urls.length === 0  || (urls.length === 1 && !urls[0])) {
    return;
} 

let body, isAll = false;
if (urls.length === 1 && urls[0] === 'All') {
    body = { purge_everything: true};
    isAll = true;
} else if (urls.length > 0) {
    body = {files: urls};
}

axios
    .post(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, body, {headers})
    .then(() => {
        fs.writeFileSync('deploy-logs.txt', `
        Busted cache for the following urls:
         ${isAll ? 'All of them' : urls.join(', ')}
         `);
    })
    .catch((error) => {
        fs.writeFileSync('deploy-logs.txt',  `
        error: ${JSON.stringify(error)}
        `);
    })

