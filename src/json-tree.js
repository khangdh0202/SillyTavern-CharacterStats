export function isPlainJsonObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function jsonValueEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
    return JSON.stringify(a) === JSON.stringify(b);
}

/* Deletes keep relative order and sets APPEND, so a diff can only rebuild
   key order "previous minus deleted, then new keys". Any other order change
   stores the container whole — key order is visible (sheet, prompt). */
function keyOrderRebuildable(previous, next) {
    const nextKeys = Object.keys(next);
    const kept = Object.keys(previous).filter(key => Object.prototype.hasOwnProperty.call(next, key));

    for (let index = 0; index < kept.length; index++) {
        if (nextKeys[index] !== kept[index]) return false;
    }

    return true;
}

export function diffJsonTree(previous, next, path = [], ops = { set: [], del: [] }) {
    if (path.length && !keyOrderRebuildable(previous, next)) {
        ops.set.push([path, next]);
        return ops;
    }

    for (const key of Object.keys(previous)) {
        if (!Object.prototype.hasOwnProperty.call(next, key)) ops.del.push([...path, key]);
    }

    for (const [key, value] of Object.entries(next)) {
        const childPath = [...path, key];

        if (!Object.prototype.hasOwnProperty.call(previous, key)) {
            ops.set.push([childPath, value]);
        } else if (isPlainJsonObject(previous[key]) && isPlainJsonObject(value)) {
            diffJsonTree(previous[key], value, childPath, ops);
        } else if (!jsonValueEqual(previous[key], value)) {
            ops.set.push([childPath, value]);
        }
    }

    return ops;
}

/* v3.1.1 K9: keys like "constructor" / "prototype" / "__proto__" are
   ordinary data in user custom JSON. Read only OWN properties and write
   with defineProperty: exact round trip, and no prototype is ever touched
   (the old skip-list dropped those keys from every delta). */
function ownTreeChild(node, key) {
    return Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined;
}

function setOwnTreeChild(node, key, value) {
    Object.defineProperty(node, key, { value, writable: true, enumerable: true, configurable: true });
}

export function applyJsonTreeOps(base, ops, { inPlace = false } = {}) {
    const result = inPlace ? base : structuredClone(base);

    for (const path of ops?.del || []) {
        let node = result;
        for (let index = 0; index < path.length - 1 && isPlainJsonObject(node); index++) node = ownTreeChild(node, path[index]);
        if (isPlainJsonObject(node)) delete node[path[path.length - 1]];
    }

    for (const [path, value] of ops?.set || []) {
        let node = result;

        for (let index = 0; index < path.length - 1; index++) {
            if (!isPlainJsonObject(ownTreeChild(node, path[index]))) setOwnTreeChild(node, path[index], {});
            node = node[path[index]];
        }

        setOwnTreeChild(node, path[path.length - 1], structuredClone(value));
    }

    return result;
}
