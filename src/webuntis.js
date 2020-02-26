import { request } from 'axios';
import { version } from '../package.json';

const constants = {
    // TODO: Is there a naming convention?
    CLIENT: `skips/${version} (http://fsoc.space)`,
    RPC_URL: 'https://erato.webuntis.com/WebUntis/jsonrpc.do',
};

export default class WebUntis {
    cookies = {};
    sessionId = null;
    currentPerson = null;

    static WrapRPC(method, body) {
        return {
            id: Date.now().toString(36), // Arbitrary
            method,
            params: body,
            jsonrpc: '2.0',
        };
    }

    constructor(school) {
        this.school = school;
    }

    async authenticate(username, password) {
        const response = await request({
            method: 'post',
            url: constants.RPC_URL,
            params: {
                school: this.school,
            },
            data: WebUntis.WrapRPC('authenticate', {
                user: username,
                password,
            }),
        });

        const { personType, personId, klasseId } = response.data.result;
        this.currentPerson = {
            id: personId,
            type: personType,
            klasse: klasseId,
        };

        this.sessionId = response.data.result.sessionId;

        return response;
    }

    async rpc(method) {
        const response = await request({
            method: 'post',
            withCredentials: true,
            url: constants.RPC_URL,
            data: WebUntis.WrapRPC(method, { test: true }),
            headers: { 'Cookies': 'JSESSIONID=' + this.sessionId + ';' },
        });

        console.log(response);

        return response;
    }
};

window.WebUntis = WebUntis;
