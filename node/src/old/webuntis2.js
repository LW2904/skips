const axios = require('axios');
const fetch = require('node-fetch');
const { version } = require('../package.json');

const constants = {
    SCHOOL: 'borglinz',
    // TODO: Is there a User-Agent naming convention?
    USER_AGENT: `skips/${version} (http://fsoc.space)`,
    RPC_URL: 'https://erato.webuntis.com/WebUntis/jsonrpc.do',
    API_URL: 'https://erato.webuntis.com/WebUntis/api/',
};

const WebUntis = class WebUntis {
    cookies = [];
    sessionId = null;
    currentPerson = null;

    static UntisDate = class UntisDate {
        dateString = '';
        dateObject = null;

        constructor(raw) {
            if (raw instanceof Date) {
                this.dateObject = raw;

                this.dateString = `${raw.getFullYear()}${raw.getMonth()}${raw.getDate()}`;
            } else if (typeof raw === 'string' && raw.length === 8) {
                this.dateString = raw;

                this.dateObject = new Date(raw.slice(0, 4), raw.slice(4, 6),
                    raw.slice(6, 8));
            }
        }
    }

    async rpcRequest(method, data, config = {}) {
        const req = {
            method: 'POST',
            url: constants.RPC_URL,
            qs: config.params || {},
            headers: {
                'User-Agent': constants.USER_AGENT,
                // 'Cookie': config.includeCookies ? this.cookies.join('; ') : '',
            },
            data: {
                id: Date.now().toString(36), // Arbitrary
                method,
                params: data,
                jsonrpc: '2.0',
            },
            // withCredentials: true,
        };

        console.log('sending rpc request');

        const response = await axios(req);

        console.log('got rpc response', response.statusText);

        if (response.data.error) {
            throw new Error('RPC Request error,'
                + JSON.stringify(response.data.error));
        }

        const setCookies = response.headers['set-cookie'];
        if (setCookies && setCookies.length) {
            for (const cookie of setCookies) {
                this.cookies.push(cookie.split(';')[0]);
            }
        }

        return response;
    }

    async authenticate(username, password) {
        const { data } = await this.rpcRequest('authenticate', {
            user: username, password,
        }, { params: { school: constants.SCHOOL } });

        const { sessionId } = data.result;
        this.sessionId = sessionId;

        const { personId, personType, klasseId } = data.result;
        this.currentPerson = { personId, personType, klasseId };

        return data.result;
    }

    async getLatestImportTime() {
        const { data } = await this.rpcRequest('getLatestImportTime', {}, {
            includeCookies: true,
        });

        const date = new Date(data.result);

        return { date, timestamp: data.result };
    }

    async getTimegrid() {
        const { data } = await this.rpcRequest('getTimegridUnits', {}, {
            includeCookies: true,
        });

        return data.result;
    }

    async getAbsences(from, to) {
        const response = await fetch("https://erato.webuntis.com/WebUntis/api/classreg/absences/students?studentId=2524&startDate=20190909&endDate=20200712&excuseStatusId=-3&includeTodaysAbsence=true", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": "JSESSIONID=F4A336133AE934E84EBA26A3C5D81736; schoolname=\"_Ym9yZ2xpbno=\"; traceId=f034381f324ce95406c433345b229156f0dfeab4"
            },
            "referrer": "https://erato.webuntis.com/WebUntis/?school=borglinz",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors"
        });

        return response.text();
    }
};

exports.WebUntis = WebUntis;
