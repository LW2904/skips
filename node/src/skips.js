require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS, UNTIS_SCHOOL } = process.env;
if (!UNTIS_USER || !UNTIS_PASS || !UNTIS_SCHOOL) {
    throw new Error('UNTIS_USER, UNTIS_PASS and UNTIS_SCHOOL env variables '
        + 'need to be set');
}

const { WebUntis } = require('./index');
const { eachWeekOfInterval } = require('date-fns');

(async () => {

const api = new WebUntis(UNTIS_SCHOOL);

await api.authenticate(UNTIS_USER, UNTIS_PASS);

const { name, startDate, endDate } = await api.getCurrentSchoolyear();
console.log(`the current school year (${name}) began ${startDate.toLocaleDateString()} `
    + `and will end ${endDate.toLocaleDateString()}`);

// The date is mostly arbitrary, should be a week with no substituted or
// cancelled lessons
const timetable = (await api.getTimetableWeek(new Date(2020, 3, 1)))
    .map((e) => ({ ...e, day: e.startDate.getDay() }));
console.log(`got ${timetable.length} lessons`);

/* const totalWeeks = eachWeekOfInterval({ start: startDate, end: endDate }).length;
const totalLessons = timetable.reduce((acc, cur) => {
    if (acc[cur.subject])
        acc[cur.subject] += totalWeeks;
    else acc[cur.subject] = totalWeeks;

    return acc;
}, {});

console.log({ totalWeeks, totalLessons }); */

const absences = await api.getAbsences(startDate, endDate);
console.log(`got ${absences.length} absences`);

const weeks = eachWeekOfInterval({ start: startDate, end: new Date() });
console.log(weeks);

})().catch(console.error);
