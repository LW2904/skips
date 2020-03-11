const BASE_URL = 'https://erato.webuntis.com/WebUntis';

const fetch = require('node-fetch');

const WebUntis = class WebUntis {
    school = null;

    personId = null;
    sessionId = null;

    constructor(school) {
        if (!school) {
            throw new Error('Insufficient arguments: school name required');
        }

        this.school = school;
    }

    rpcify(method, params = {}) {
        return {
            jsonrpc: '2.0',
            method, params,
            id: Date.now().toString(36),
        };
    }

    get rpcUri() { return `${BASE_URL}/jsonrpc.do?school=${this.school}`; }

    async authenticate(username, password) {
        if (!username || !password) {
            throw new Error('Insufficient arguments: username, password required');
        }

        const result = await fetch(this.rpcUri, {
            'method': 'POST',
            'body': JSON.stringify(this.rpcify('authenticate', {
                'user': username, 'password': password,
            })),
        });

        console.log('authenticate', { ok: result.ok });

        const { sessionId, personId } = (await result.json()).result;

        if (!sessionId || !personId) {
            throw new Error('Failed retrieving data');
        }

        if (sessionId.length !== 32) {
            console.log('Unusual sessionId length encountered',
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

        const uri = `${BASE_URL}/api/classreg/absences/students?`
            + `studentId=${this.personId}&startDate=${startDate}&endDate=${endDate}`
            + `&excuseStatusId=-3&includeTodaysAbsence=true`

        const result = await fetch(uri, {
            'headers': {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                // Removed `schoolname` and `traceid` cookies
                'cookie': `JSESSIONID=${this.sessionId}`,
            },
            'referrer': 'https://erato.webuntis.com/WebUntis/?school=borglinz',
            'referrerPolicy': 'no-referrer-when-downgrade',
            'body': null,
            'method': 'GET',
            'mode': 'cors',
        });

        console.log('getAbsences', { ok: result.ok });

        const absences = (await result.json()).data.absences;

        if (absences === null || typeof absences !== 'object' ||
            absences.length === undefined)
        {
            throw new Error('Failed retrieving data');
        }

        return absences;
    }

    async getCurrentSchoolyear() {
        if (!this.sessionId) {
            throw new Error('Unauthenticated instance');
        }

        const result = await fetch(this.rpcUri, {
            'method': 'POST',
            'headers': {
                'cookie': `JSESSIONID=${this.sessionId}`,
            },
            'body': JSON.stringify(this.rpcify('getCurrentSchoolyear')),
        });

        console.log('getCurrentSchoolyear', { ok: result.ok });

        const { name, startDate, endDate } = (await result.json()).result;

        if (!name || !startDate || !endDate) {
            throw new Error('Failed retrieving data');
        }

        return { name, startDate, endDate };
    }
};

exports.WebUntis = WebUntis;
