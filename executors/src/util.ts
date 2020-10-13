
if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});

/**
 * Convert object to string
 * https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
 * 
 * @param obj 
 */
const toJson = (obj: unknown): string => {
    return JSON.stringify(obj, function replacer(key, value) {
        return value
    }

    , '\t')
};

export { toJson }