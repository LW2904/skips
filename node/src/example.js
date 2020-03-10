require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS, UNTIS_SCHOOL } = process.env;
if (!UNTIS_USER || !UNTIS_PASS || !UNTIS_SCHOOL) {
    throw new Error('UNTIS_USER, UNTIS_PASS and UNTIS_SCHOOL env variables '
        + 'need to be set');
}

const { WebUntis } = require('./webuntis');

(async () => {

const api = new WebUntis(UNTIS_SCHOOL);

await api.authenticate(UNTIS_USER, UNTIS_PASS);

const { startDate, endDate } = await api.getCurrentSchoolyear();
const absences = await api.getAbsences(startDate, endDate);

console.log(absences);

})().catch(console.error);
