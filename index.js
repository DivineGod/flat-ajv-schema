function getDefs(validator, knownDefs = []) {
    var refs = validator.refs;
    if (!refs) {
        return validator.schema;
    }
    var refKeys = Object.keys(refs).filter((ref) => !~knownDefs.indexOf(ref));
    var defs = refKeys.reduce((arr, ref) => {
        var refValIndex = refs[ref];
        let refVal = validator.refVal[refValIndex];
        arr[ref] = refVal.schema || refVal;
        knownDefs.push.apply(knownDefs, Object.keys(arr))
        return Object.assign({}, arr, getDefs(refVal, knownDefs));
    }, {});
    return defs;
}

function flattener(validator) {
    if (!validator || !(typeof validator === 'function')) {
        return;
    }
    return {
        defs: getDefs(validator),
        schema: validator.schema,
    };
}

module.exports = flattener;
