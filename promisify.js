module.exports.promisify = function promisify(func, scope) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            func.apply(scope || this, args.concat((err, result) => {
                if (err) reject(err); else resolve(result);
            }));
        });
    }
}