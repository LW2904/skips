## `skips/node`

```javascript
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
```

See `src/example.js` for a runnable example.
