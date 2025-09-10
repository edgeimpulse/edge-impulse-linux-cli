export async function asyncPool<IN, OUT>(poolLimit: number, array: readonly IN[],
                                         iteratorFn: (generator: IN) => Promise <OUT>): Promise<OUT[]> {
    const ret = [];
    const executing: Promise<OUT>[] = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (poolLimit <= array.length) {
            const e = <Promise<OUT>>p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}
