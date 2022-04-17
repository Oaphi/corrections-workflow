const diffSets = <T>(setA: Set<T>, setB: Set<T>): [Set<T>, Set<T>] => {
    const diffA = new Set<T>();
    const diffB = new Set<T>();

    setA.forEach((v) => setB.has(v) || diffA.add(v));
    setB.forEach((v) => setA.has(v) || diffB.add(v));

    return [diffA, diffB];
};

const filterSet = <T>(
    set: Set<T>,
    comparator: (v: T, i: number, s: Set<T>) => boolean
): Set<T> => {
    const filtered = new Set<T>();

    let i = 0;
    set.forEach((v) => {
        if (comparator(v, i, set)) filtered.add(v);
        i++;
    });

    return filtered;
};

const mergeSets = <T>(...sources: Set<T>[]): Set<T> => {
    const merged = new Set<T>();
    sources.forEach((s) => s.forEach((v) => merged.add(v)));
    return merged;
};