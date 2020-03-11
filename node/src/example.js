require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS, UNTIS_SCHOOL } = process.env;
if (!UNTIS_USER || !UNTIS_PASS || !UNTIS_SCHOOL) {
    throw new Error('UNTIS_USER, UNTIS_PASS and UNTIS_SCHOOL env variables '
        + 'need to be set');
}

const { WebUntis } = require('./index');

(async () => {

const api = new WebUntis(UNTIS_SCHOOL);

await api.authenticate(UNTIS_USER, UNTIS_PASS);

const { name, startDate, endDate } = await api.getCurrentSchoolyear();
console.log(`the current school year (${name}) began ${startDate.toLocaleDateString()} `
    + `and will end ${endDate.toLocaleDateString()}`);

const absences = await api.getAbsences(startDate, endDate);
console.log(`got ${absences.length} absences`);

const timetable = await api.getTimetableWeek(new Date());
console.log(`got timetable fpr the current week with ${timetable.length} lessons`);

})().catch(console.error);
