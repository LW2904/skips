## `skips/node`

```javascript
class WebUntis {
    constructor(schoolname)

    async authenticate(username, password)
    async getAbsences(startDate, endDate)
    async getCurrentSchoolyear()
}
```

Note that `startDate` and `endDate` should be date strings of the format `YYYYMMDD`, the same format is also used internally by Untis and in the dates returned by `getCurrentSchoolyear()`.

### Example

```javascript
// src/example.js
const { WebUntis } = require('./webuntis');

(async () => {

const api = new WebUntis(UNTIS_SCHOOL);

await api.authenticate(UNTIS_USER, UNTIS_PASS);

const { startDate, endDate } = await api.getCurrentSchoolyear();
const absences = await api.getAbsences(startDate, endDate);

console.log(absences);

})().catch(console.error);

```
