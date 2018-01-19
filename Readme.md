# flat-ajv-schema

The purpose of flat-ajv-schema is to take a compiled ajv json schema instance validator function and extract the schema including any and all references used in the schema.

## Usage

```javascript
var Ajv = require('ajv');

var flattener = require('flat-ajv-schema');

var defSchema = { $id: 'defs', one: { type: 'string' } };
var valSchema = { $id: 'valSchema', $ref: 'defs#/one' };

var validator = new Ajv({ schemas: [ defsSchema, validatorSchema ]}).getSchema('valSchema');

var flatSchema = flattener(validator);

// flatSchema is now:
/*
    {
        defs: {
            'defs#/one': { type: 'string' },
        },
        valSchema: {
            $id: 'valSchema',
            $ref: 'defs#/one',
        },
    }
*/
```
