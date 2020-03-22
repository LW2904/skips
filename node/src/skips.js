require('dotenv').config();

const { UNTIS_USER, UNTIS_PASS, UNTIS_SCHOOL } = process.env;
if (!UNTIS_USER || !UNTIS_PASS || !UNTIS_SCHOOL) {
    throw new Error('UNTIS_USER, UNTIS_PASS and UNTIS_SCHOOL env variables '
        + 'need to be set');
}

const { WebUntis } = require('./index');
const { getISODay, areIntervalsOverlapping } = require('date-fns');

(async () => {

const api = new WebUntis(UNTIS_SCHOOL);

await api.authenticate(UNTIS_USER, UNTIS_PASS);

const { name, startDate, endDate } = await api.getCurrentSchoolyear();
console.log(`the current school year (${name}) began ${startDate.toLocaleDateString()} `
    + `and will end ${endDate.toLocaleDateString()}`);

// The date is mostly arbitrary, should be a week with no substituted or
// cancelled lessons
const timetable = (await api.getTimetableWeek(new Date(2020, 2, 16)))
    .map((e) => ({ ...e, day: getISODay(e.startDate) }));
console.log(`got ${timetable.length} lessons`);

const absences = (await api.getAbsences(startDate, endDate))
    // Absences should never span multiple days so this is fine
    .map((e) => ({ ...e, day: getISODay(e.startDate) }));

console.log(`got ${absences.length} absences`);

const timetableDays = timetable.reduce((acc, cur) => {
    if (acc[cur.day]) {
        acc[cur.day].push(cur);
    } else {
        acc[cur.day] = [ cur ];
    }

    return acc;
}, {});

const absentLessons = {};

for (const a of absences) {
    const td = timetableDays[a.day];
    const ai = { start: a.startDate, end: a.endDate };

    for (const l of td) {
        l.startDate.setDate(a.startDate.getDate());
        l.startDate.setMonth(a.startDate.getMonth());
        l.endDate.setDate(a.endDate.getDate());
        l.endDate.setMonth(a.endDate.getMonth());

        if (areIntervalsOverlapping({ start: l.startDate, end: l.endDate }, ai)) {
            absentLessons[l.subject] = (absentLessons[l.subject] || 0) + 1;
        }
    }
}

console.log(absentLessons);

})().catch(console.error);
