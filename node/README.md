## `skips/node`

1. `POST https://erato.webuntis.com/WebUntis/j_spring_security_check`

With the following Form Data:

```
{
    school: borglinz, j_username: USER, j_password: PASS, token: <empty>
}
```

Returns `JSESSION`, `schoolname` (`_ + Base64(borglinz)`?) and auth (also looks like `_ + Base64(?)`) through Set-Cookie.

_TODO: Why would Base64 encoded strings be prefixed with an underscore. Is there a Base64 encoder which does this by default (Untis uses Java)._


