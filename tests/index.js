var test = require('tape');
var Ajv = require('ajv');

var flattener = require('../');

var testSchemas = [
    {
        $id: 'defs',
        one: { type: 'object', properties: { first: { $ref: 'defs#/two' } } },
        two: { type: 'object', properties: { second: { $ref: 'defs#/one' } } },
        three: { type: 'array', items: { $ref: 'defs#/one' } },
    },
    {
        $id: 'test',
        request: {
            type: 'array',
            items: { $ref: 'defs#/one' },
        },
    },
];
var expected = {
    defs: {
        'defs#/one': { type: 'object', properties: { first: { $ref: 'defs#/two' } } },
        'defs#/two': { type: 'object', properties: { second: { $ref: 'defs#/one' } } },
    },
    schema: {
        type: 'array',
        items: { $ref: 'defs#/one' },
    }
};

test('Flatten schema correctly', (t) => {
    t.plan(2);
    var ajv = new Ajv({ schemas: testSchemas });
    var validator = ajv.getSchema('test#/request');
    var flat = flattener(validator);

    t.ok(flat, 'flattened the schema');
    t.deepEqual(flat, expected, 'correctly flattened the schema');
});

test('works with addSchema', (t) => {
    t.plan(2);
    var ajv = new Ajv();
    ajv.addSchema(testSchemas[0]);
    ajv.addSchema(testSchemas[1]);
    var validator = ajv.getSchema('test#/request');
    var flat = flattener(validator);

    t.ok(flat, 'flattened the schema');
    t.deepEqual(flat, expected, 'correctly flattened the schema');
})

test('proper errors', (t) => {
    t.plan(2);

    var flat = flattener();
    t.notOk(flat);

    flat = flattener({});
    t.notOk(flat);
});

test('proper flattening', (t) => {
    t.plan(2);
    var blockGetSchemas = [
        {
            $id: 'defs',
            'psychwire:block': {
                id: 'psychwire:block',
                type: 'object',
                additionalProperties: false,
                required: [
                    'ordinal',
                ],
                properties: {
                    id: {
                        'isId': true,
                    },
                    type: {
                        enum: [
                            'html',
                            'markdown',
                            'video',
                        ],
                    },
                    ordinal: {
                        type: 'number',
                    },
                    htmlBlock: {
                        type: [
                            'object',
                            'null',
                        ],
                    },
                    markdownBlock: {
                        type: [
                            'object',
                            'null',
                        ],
                    },
                    videoBlock: {
                        type: [
                            'object',
                            'null',
                        ],
                    },
                },
            },
        },
        {
            request: {
                type: 'array',
                items: [
                    {
                        description: 'query',
                        type: [
                            'object',
                            'null',
                        ],
                        required: [],
                        additionalProperties: false,
                        properties: {
                            ids: {
                                type: 'array',
                                items: {
                                    isId: true,
                                },
                            },
                        },
                    },
                ],
                minItems: 1,
                maxItems: 1,
            },
            response: {
                type: 'array',
                items: {
                    $ref: 'defs#/psychwire:block',
                },
            },
            $id: 'block.get',
        },
    ];
    var expectedBlockGetSchema = {
        defs: {
            'defs#/psychwire:block': blockGetSchemas[0]['psychwire:block'],
        },
        schema: blockGetSchemas[1].response,
    };

    var ajv = new Ajv({ schemas: blockGetSchemas });
    var validator = ajv.getSchema('block.get#/response');
    var flat = flattener(validator);

    t.ok(flat, 'flattened the schema');
    t.deepEqual(flat, expectedBlockGetSchema, 'correctly flattened the schema');
});
