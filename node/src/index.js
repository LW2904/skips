require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS } = process.env;
if (!UNTIS_USER || !UNTIS_PASS) {
    throw new Error('UNTIS_USER and UNTIS_PASS env variables need to be set!');
}

const { log } = require('./logger');
const { WebUntis } = require('./webuntis');

(async () => {

const api = new WebUntis('borglinz');

log.info(await api.authenticate(process.env.UNTIS_USER, process.env.UNTIS_PASS), 'session');

log.info(await api.getLatestImportTime(), 'last import');

})().catch(log.fatal);
