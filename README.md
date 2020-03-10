# skips

_skips_ is supposed to be a webapp allowing students of the BORG Linz to calculate their absence rate as such a service is not officially provided.

I'm currently playing around with an API wrapping some relevant internal WebUntis enpoints (see the `node/` folder) which is why development of the frontend has been paused for the moment.

`doc/` contains an official looking but apparently not openly distributet specification of a WebUntis RPC API. The API doesn't appear to be used on their main website but some endpoints are of interest nevertheless.

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run serve

# run tests with jest and preact-render-spy 
npm run test
```

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
