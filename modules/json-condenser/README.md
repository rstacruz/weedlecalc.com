# json-condenser

Condenses JSON by shortening literals.

```
const KEYS = ['id', 'name', 'email', 'role', 'admin']
const json = [{"id":1,"name":"John","email":"john@gmail.com","role":"admin"}]

let payload = condense(KEYS, json)
//=> [{e:1,f:"John",g:"john@gmail.com",h:i}]

expand(KEYS, payload)
//=> [{"id":1,"name":"John","email":"john@gmail.com","role":"admin"}]
  ```
