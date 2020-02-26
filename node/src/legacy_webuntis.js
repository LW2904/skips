const axios = require('axios');
const { version } = require('../package.json');

const constants = {
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

    constructor(school) {
        this.school = school;
    }

    async rpcRequest(method, data, config = {}) {
        const request = {
            method: 'post',
            url: constants.RPC_URL,
            params: config.params || {},
            headers: {
                'User-Agent': constants.USER_AGENT,
                'Cookie': config.includeCookies ? this.cookies.join('; ') : '',
            },
            data: {
                id: Date.now().toString(36), // Arbitrary
                method,
                params: data,
                jsonrpc: '2.0',
            },
            withCredentials: true,
        };

        console.log('sending rpc request');

        const response = await axios(request);

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
        }, { params: { school: this.school } });

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
        const config = {
            method: 'post',
            url: constants.API_URL + 'classreg/absences/students',
            headers: {
                'User-Agent': constants.USER_AGENT,
                'Cookie': this.cookies.join('; '),
                // The following are unneccesary
                'Origin': 'https://erato.webuntis.com',
                'Host': 'erato.webuntis.com',
                'Referer': 'https://erato.webuntis.com/WebUntis/index.do',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
            params: {
                studentId: this.currentPerson.personId,
                startDate: new WebUntis.UntisDate(from).dateString,
                endDate: new WebUntis.UntisDate(to).dateString,
                excuseStatusId: -1, // What's this?
                // includeTodaysAbsences: true, // I guess?
            },
            withCredentials: true,
        };

        console.log('sending api request', config);

        const response = await axios(config);

        console.log('got api response', response.statusText);

        return response;
    }
};

exports.WebUntis = WebUntis;
