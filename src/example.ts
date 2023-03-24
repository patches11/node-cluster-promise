import { range, sleep } from "./utils";
import { ClusterPromise } from "./cluster-promise";

const slow = async ({ n }: { n: number }): Promise<number> => {
  console.log(`(${n}) running on ${process.pid}`);
  await sleep(n);
  return n;
};

const test = async ({ n }: { n: string }): Promise<string> => {
  console.log(`(${n}) running on ${process.pid}`);
  return n.toString();
};

const test2 = async (abc: string): Promise<string> => {
  return abc;
};

const functions = {
  slow,
  test,
  test2,
};

const run = async () => {
  const clusterPromise = new ClusterPromise(functions);

  clusterPromise.onPrimary(async () => {
    const promises = range(1000, 1100).map(async (n) => {
      console.log(`starting ${n}`);
      const test = clusterPromise.run("slow", { n });
      return test;
    });

    await Promise.all(promises).then((results) => {
      results.forEach((v) => {
        console.log(`finished ${v}`);
      });
    });

    clusterPromise.shutdown();
  });
};

run();
