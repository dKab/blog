const axios = require('axios');
const fs = require('fs');

const {CLOUDFLARE_X_AUTH_KEY, CLOUDFLARE_X_AUTH_EMAIL, CLOUDFLARE_ZONE_ID } = process.env;

const urls = fs.readFileSync('urls-to-purge.txt', 'utf8').toString().split('\n');
const headers = {
    'X-Auth-Email': CLOUDFLARE_X_AUTH_EMAIL,
    'X-Auth-Key': CLOUDFLARE_X_AUTH_KEY,
    'Content-Type': 'application/json'
};
const body = urls.length ? {files: urls} : { purge_everything: true};
axios
    .post(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, body, {headers})
    .then(() => {
        console.log(`busted cache for the following urls ${urls.length ? urls.join(', ') : 'All of them'}`)
        fs.writeFileSync('deploy-logs.txt', `${JSON.stringify(urls)}
        Busted cache for the following urls ${urls.length ? urls.join(', ') : 'All of them'}`);
    })
    .catch((error) => {
        console.error('Couldn\'t bust cache');
        console.log(error);
        fs.writeFileSync('deploy-logs.txt',  JSON.stringify(urls) + '\nerror:' + JSON.stringify(error));
    })

