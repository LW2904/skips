## `skips/node`

```javascript
// src/example.js
const { WebUntis } = require('./webuntis');

(async () => {

const api = new WebUntis('myschool');

await api.authenticate('janedoe', 'supersecret');

const { startDate, endDate } = await api.getCurrentSchoolyear();
const absences = await api.getAbsences(startDate, endDate);

console.log(absences);

})().catch(console.error);
```

## Classes

<dl>
<dt><a href="#WebUntis">WebUntis</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Absence">Absence</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#TimetableEntry">TimetableEntry</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="WebUntis"></a>

## WebUntis

* [WebUntis](#WebUntis)
    * [new WebUntis(school)](#new_WebUntis_new)
    * _instance_
        * [.authenticate(username, password)](#WebUntis+authenticate) ⇒ <code>Object</code>
        * [.getAbsences(startDate, endDate)](#WebUntis+getAbsences) ⇒ [<code>Array.&lt;Absence&gt;</code>](#Absence)
        * [.getCurrentSchoolyear()](#WebUntis+getCurrentSchoolyear) ⇒ <code>Object</code>
        * [.getTimetableWeek(date)](#WebUntis+getTimetableWeek) ⇒ [<code>Array.&lt;TimetableEntry&gt;</code>](#TimetableEntry)
    * _static_
        * [.parseUntisTime(untisTime)](#WebUntis.parseUntisTime) ⇒ <code>Object</code>
        * [.parseUntisDate(untisDate)](#WebUntis.parseUntisDate) ⇒ <code>Date</code>
        * [.parseUntisDateTime(untisDate, untisTime)](#WebUntis.parseUntisDateTime) ⇒ <code>Date</code>
        * [.dateToUntisDate(date, [separator])](#WebUntis.dateToUntisDate) ⇒ <code>string</code>

<a name="new_WebUntis_new"></a>

### new WebUntis(school)
Creates a WebUntis instance.

**Params**

- school <code>string</code>

<a name="WebUntis+authenticate"></a>

### webUntis.authenticate(username, password) ⇒ <code>Object</code>
Authenticates this instance with the given login data.

**Params**

- username <code>string</code>
- password <code>string</code>

<a name="WebUntis+getAbsences"></a>

### webUntis.getAbsences(startDate, endDate) ⇒ [<code>Array.&lt;Absence&gt;</code>](#Absence)
Returns all absences, excused and unexcused, in the given interval for 
the current user.

**Params**

- startDate <code>Date</code>
- endDate <code>Date</code>

<a name="WebUntis+getCurrentSchoolyear"></a>

### webUntis.getCurrentSchoolyear() ⇒ <code>Object</code>
Gets the current schoolyear.

<a name="WebUntis+getTimetableWeek"></a>

### webUntis.getTimetableWeek(date) ⇒ [<code>Array.&lt;TimetableEntry&gt;</code>](#TimetableEntry)
Gets the timetable of the current user for a given week.

**Params**

- date <code>Date</code> - any day of the week for which the timetable is
                     requested

<a name="WebUntis.parseUntisTime"></a>

### WebUntis.parseUntisTime(untisTime) ⇒ <code>Object</code>
**Params**

- untisTime <code>string</code>

<a name="WebUntis.parseUntisDate"></a>

### WebUntis.parseUntisDate(untisDate) ⇒ <code>Date</code>
**Params**

- untisDate <code>string</code> - 'YYYYMMDD'

<a name="WebUntis.parseUntisDateTime"></a>

### WebUntis.parseUntisDateTime(untisDate, untisTime) ⇒ <code>Date</code>
**Params**

- untisDate <code>String</code> | <code>Number</code> - 'YYYYMMDD'
- untisTime <code>String</code> | <code>Number</code> - 'HHMM' local 24h based time

<a name="WebUntis.dateToUntisDate"></a>

### WebUntis.dateToUntisDate(date, [separator]) ⇒ <code>string</code>
**Returns**: <code>string</code> - - An Untis date of the format 'YYYY*MM*DD' where '*'
stands for the optional separator.  
**Params**

- date <code>Date</code>
- [separator] <code>string</code> <code> = &quot;&#x27;&#x27;&quot;</code>

<a name="Absence"></a>

## Absence : <code>object</code>
**Properties**

| Name | Type |
| --- | --- |
| startDate | <code>Date</code> | 
| endDate | <code>Date</code> | 
| excused | <code>boolean</code> | 

<a name="TimetableEntry"></a>

## TimetableEntry : <code>object</code>
**Properties**

| Name | Type |
| --- | --- |
| startDate | <code>Date</code> | 
| endDate | <code>Date</code> | 
| subject | <code>string</code> | 
| cancelled | <code>boolean</code> | 
