import { range, sleep } from "./utils";
import { ClusterPromise } from "./cluster-promise";
import { GetFirstArgumentOfAnyFunction, Functions } from "./interfaces";

const slow = async ({ n }: { n: number }): Promise<number> => {
  console.log(`(${n}) running on ${process.pid}`);
  await sleep(n);
  return n;
};

const test = async ({ n }: { n: string }): Promise<string> => {
  console.log(`(${n}) running on ${process.pid}`);
  return n.toString();
};

const functions = {
  slow,
  test,
};

const clusterPromise = new ClusterPromise({});
const cp1 = clusterPromise.addFunction("slow", slow);
const cp2 = cp1.addFunction("test", test);

const cp3 = new ClusterPromise({slow});

const testA = <
  TPath extends keyof typeof functions,
  TOutput extends ReturnType<typeof functions[TPath]>
>(
  path: TPath,
  opts: GetFirstArgumentOfAnyFunction<typeof functions[TPath]>
): TOutput => {
  return functions[path](opts as any) as any;
};

clusterPromise.onPrimary(() => {
  const promises = range(1000, 1100).map(async (n) => {
    console.log(`starting ${n}`);
    const test = cp2.run("slow", { n: n.toString() });
    return test;
  });

  Promise.all(promises).then((results) => {
    results.forEach((v) => {
      console.log(`finished ${v}`);
    });
  });
});
