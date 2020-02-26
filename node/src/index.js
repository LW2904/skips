require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS } = process.env;
if (!UNTIS_USER || !UNTIS_PASS) {
    throw new Error('UNTIS_USER and UNTIS_PASS env variables need to be set!');
}
