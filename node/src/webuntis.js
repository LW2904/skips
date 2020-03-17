const debug = require('debug');
const fetch = require('node-fetch');
const { startOfISOWeek } = require('date-fns');

const WebUntis = class WebUntis {
    // Debug logging can be enabled by setting the environment variable `DEBUG`
    // to `webuntis`.
    static debug = debug('webuntis');
    static baseUrl = 'https://erato.webuntis.com/WebUntis';

    // `untisTime` should follow the format `HHMM`.
    static parseUntisTime(untisTime) {
        const timeString = untisTime.toString().padStart(4, ' ');

        return {
            hour: parseInt(timeString.slice(0, 2).trim()),
            minute: parseInt(timeString.slice(2, 4).trim()),
        };
    }

    // `untisDate` should follow the format `YYYYMMDD`.
    static parseUntisDate(untisDate) {
        const dateString = untisDate.toString();

        const year = parseInt(dateString.slice(0, 4));
        const month = parseInt(dateString.slice(4, 6));
        const day = parseInt(dateString.slice(6, 8));

        const date = new Date();

        date.setDate(day);
        date.setFullYear(year);
        date.setMonth(month - 1);

        // Zero unused date fields to prevent confusion since they would default
        // to the current date.
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    }

    // See `parseUntisTime` and `parseUntisDate` for argument formatting.
    static parseUntisDateTime(untisDate, untisTime) {
        const date = WebUntis.parseUntisDate(untisDate);
        const time = WebUntis.parseUntisTime(untisTime);

        // Since this works it can be assumed that Untis time hours are `[0, 23]`.
        date.setHours(time.hour);
        date.setMinutes(time.minute);

        return date;
    }

    // Converts a JavaScript `Date` object to a Untis date (`YYYYMMDD`), with
    // an optional separator between years, months and days.
    static dateToUntisDate(date, separator = '') {
        const day = (date.getDate()).toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        return date.getFullYear() + separator + month + separator + day;
    }

    // Element ID of the logged in student.
    personId = null;
    // Used for authentication through a `JSESSIONID` cookie.
    sessionId = null;

    constructor(school) {
        if (!school) {
            throw new Error('Insufficient arguments: school name required');
        }

        this.school = school;
        this.debug = WebUntis.debug;
    }

    async request(uri, ...args) {
        const url = `${WebUntis.baseUrl}${uri}`;
        // TODO: Merge headers given in args with reasonable default headers.
        const result = await fetch(url, ...args);

        // Don't log query strings for brevity (and security, of course).
        this.debug('%o: %O', result.status, uri.slice(0, uri.indexOf('?')));

        if (!result.ok) {
            // TODO: Implement error parsing.
            throw new Error(await result.text());
        }

        return await result.json();
    }

    async rpc(method, params) {
        this.debug('rpc request: %o', method);

        const res = await this.request(`/jsonrpc.do?school=${this.school}`, {
            method: 'POST',
            // Follows the JSON-RPC specification.
            body: JSON.stringify({
                jsonrpc: '2.0',
                method, params,
                // This is completely arbitrary and unused in the library, but 
                // the spec requires it.
                id: Date.now().toString(36),
            }),
            headers: this.sessionId ? {
                'cookie': `JSESSIONID=${this.sessionId}`,
            } : {},
        });

        if (res.error) {
            throw new Error(res.error);
        }

        if (!res.result) {
            throw new Error(`No result returned`, res);
        }

        return res.result;
    }

    async authenticate(username, password) {
        if (!username || !password) {
            throw new Error('Insufficient arguments: username, password required');
        }

        const { sessionId, personId } = await this.rpc('authenticate', {
            user: username, password,
        });

        if (!sessionId || !personId) {
            throw new Error('Missing response data');
        }

        if (sessionId.length !== 32) {
            console.log('Unusual session ID length encountered',
                sessionId.length);
        }

        this.personId = personId;
        this.sessionId = sessionId;

        return { sessionId, personId };
    }

    async getAbsences(startDate, endDate) {
        if (!this.sessionId) {
            throw new Error('Unauthenticated instance');
        }

        if (!startDate || !endDate) {
            throw new Error('Insufficient arguments: startDate, endDate required');
        }

        const uri = `/api/classreg/absences/students?`
            // `excuseStatusId` is untested and undocumented, not sure if it's
            // even used, internally.
            + `studentId=${this.personId}&excuseStatusId=-1&includeTodaysAbsence=true`
            + `&startDate=${WebUntis.dateToUntisDate(startDate)}`
            + `&endDate=${WebUntis.dateToUntisDate(endDate)}`;

        const { absences } = (await this.request(uri, {
            'headers': {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                // Removed `schoolname` and `traceid` cookies.
                'cookie': `JSESSIONID=${this.sessionId}`,
            },
            'referrer': 'https://erato.webuntis.com/WebUntis/?school=borglinz',
            'referrerPolicy': 'no-referrer-when-downgrade',
            'body': null,
            'method': 'GET',
            'mode': 'cors',
        })).data;

        if (absences === null || typeof absences !== 'object' ||
            absences.length === undefined)
        {
            throw new Error('Missing response data');
        }

        return absences.map((e) => {
            const startDate = WebUntis.parseUntisDateTime(e.startDate,
                e.startTime);
            const endDate = WebUntis.parseUntisDateTime(e.endDate,
                e.endTime);

            return {
                startDate, endDate,
                excused: e.isExcused,
            };
        });
    }

    async getCurrentSchoolyear() {
        if (!this.sessionId) {
            throw new Error('Unauthenticated instance');
        }

        const { name, startDate, endDate } = await this.rpc('getCurrentSchoolyear');

        if (!name || !startDate || !endDate) {
            throw new Error('Missing response data');
        }

        return { name, startDate: WebUntis.parseUntisDate(startDate),
            endDate: WebUntis.parseUntisDate(endDate) };
    }

    async getTimetableWeek(date) {
        if (!date) {
            throw new Error('Insufficient arguments: date required');
        }

        if (!this.sessionId) {
            throw new Error('Unauthenticated instance');
        }

        // Use ISO weeks since they start on mondays.
        const mondayInWeek = WebUntis.dateToUntisDate(
            startOfISOWeek(date), '-');

        const uri = `/api/public/timetable/weekly/data?`
            // `elementType=5` is a timetable, see RPC API spec.
            + `elementType=5&`
            + `elementId=${this.personId}&`
            // `date` must be of the format `YYYY-MM-DD` (as opposed to the more
            // commonly seen format `YYYYMMDD`). It should be the monday of the
            // requested week, otherwise results for the following week are 
            // returned. This was tested very hapharzardly, it might well be
            // more nuanced than that.
            + `date=${mondayInWeek}&`
            // `formatId` is undocumented, I didn't test how it affects the
            // response.
            + `formatId=1`

        const result = await this.request(uri, {
            'headers': {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                // Removed the `schoolname` cookie.
                'cookie': `JSESSIONID=${this.sessionId}`,
            },
            'referrer': 'https://erato.webuntis.com/WebUntis/index.do',
            'referrerPolicy': 'no-referrer-when-downgrade',
            'body': null,
            'method': 'GET',
            'mode': 'cors',
        });

        // Get your shit together, Untis.
        const data = result.data.result.data;

        // `rawElements`, as returned by the request, follows the following format:
        // ```
        // {
        //     type: see RPC API spec,
        //     id: only unique within type,
        //     for subjects:
        //     name: name,
        //     longName: long name, never used online?,
        //     ...
        // }
        // ```
        const rawElements = data.elements;

        // `rawPeriods`, as returned by the request, follows the following format:
        // ```
        // {
        //     date: regular untis date string,
        //     endTime: number, 'HHMM',
        //     startTime: see endTime,
        //     elements: {
        //         id: element id within a type,
        //         type: element type,
        //         ...
        //     },
        //     ...
        // }
        // ```
        // Of note for potential future rewrites is the `studentGroup` property
        // with the format `${shortSubject}_${studentgroups}_${shortTeacher}`
        // which could be used to skip crossmatching with `rawElements`.
        const rawPeriods = data.elementPeriods[data.elementIds[0]];

        const elements = {};

        // Parse raw elements array into subarrays by type.
        for (const rawEl of rawElements) {
            if (!elements[rawEl.type]) {
                elements[rawEl.type] = [ rawEl ];
            } else {
                elements[rawEl.type].push(rawEl);
            }
        }

        // Parse type subarrays into objects with ids as keys, elements can now be
        // accessed through elements[type][id].
        for (const type in elements) {
            elements[type] = elements[type].reduce((acc, cur) => {
                if (!acc[cur.id])
                    acc[cur.id] = cur;

                return acc;
            }, {});
        }

        const periods = [];

        for (const rawPer of rawPeriods) {
            const endDate = WebUntis.parseUntisDateTime(rawPer.date,
                rawPer.endTime);
            const startDate = WebUntis.parseUntisDateTime(rawPer.date,
                rawPer.startTime);

            periods.push({
                startDate, endDate,
                subject: elements['3']
                    [rawPer.elements.filter((e) => e.type == 3)[0].id].name,
                // This appears to be set even for substituted lessons, not sure
                // if they officially count for absence rates and the like.
                cancelled: rawPer.is.cancelled || false,
            });
        }

        return periods.sort((a, b) => a.startDate - b.startDate);
    }
};

exports.WebUntis = WebUntis;
