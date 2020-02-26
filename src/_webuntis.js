export default class WebUntis {
    client = 'fsoc.space::skips';

    rpc = {
        id: 0,
        url: 'https://erato.webuntis.com/WebUntis/jsonrpc.do',
    };

    headers = {
        'User-Agent': this.client,
    };

    cookies = {};

    person = {
        id: null,
        type: null,
        klasse: null, // Grade? Form?
    };

    constructor(school) {
        this.school = school;
        this.schoolHash = '_' + window.btoa(school);

        this.cookies['schoolname'] = this.schoolHash;
    }

    async rpcRequest(method, params = {}, config = {}) {
        // Includes school param in every request, not sure if required
        const query = new URLSearchParams(
            Object.assign({ school: this.school }, config.query)
        );

        const uri = this.rpc.url + (query ? ('?' + query) : '');

        const body = JSON.stringify({
            method,
            params,
            jsonrpc: '2.0',
            id: ++this.rpc.id,
        });

        const headers = Object.assign(this.headers, config.cookies !== false ? {
            'Cookies': Object.values(this.cookies)
                .map((c) => `${c}=${this.cookies[c]};`).join(' ')
        } : {});

        console.log('sending rpc request to', uri, body, headers);

        const response = await (await fetch(uri, {
            body,
            headers,
            method: 'POST',
            credentials: 'include',
        })).json();

        console.log('got rpc response', response);

        return await response;
    }

    async authenticate(username, password) {
        const response = await this.rpcRequest('authenticate', {
            user: username, password, client: this.client,
        }, { cookies: false });

        const { result } = response;
        if (!response.error && result) {
            if (!result.sessionid && !result.personId) {
                throw new Error('Incomplete response');
            }

            this.cookies['JSESSIONID'] = result.sessionid;

            this.person.id = result.personId;
            this.person.type = result.personType;
            this.person.klasse = result.klasseId;
        }

        return response;
    }

    async getUpdateDate() {
        const response = await this.rpcRequest('getLatestImportTime');

        return response;
    }
}
