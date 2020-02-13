const axios = require('axios');
const { version } = require('../package.json');

const { log } = require('./logger');

const constants = {
    // TODO: Is there a User-Agent naming convention?
    USER_AGENT: `skips/${version} (http://fsoc.space)`,
    RPC_URL: 'https://erato.webuntis.com/WebUntis/jsonrpc.do',
};

const WebUntis = class WebUntis {
    cookies = [];
    sessionId = null;
    currentPerson = null;

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

        log.debug(request, 'rpc request');

        const response = await axios(request);

        log.debug(response.statusText, 'rpc response');

        if (response.data.error) {
            throw new Error('RPC Request error: '
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
        const { data } = await this.rpcRequest('getTimegrid', {}, {
            includeCookies: true,
        });

        return data.result;
    }
};

exports.WebUntis = WebUntis;
