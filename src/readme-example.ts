import { ClusterPromise } from "./cluster-promise";
import { sleep } from "./utils";

const functions = {
  a: async (n: number) => n,
  b: async (str: string) => str,
};

const run = async () => {
  const clusterPromise = new ClusterPromise(functions);

  await clusterPromise.onPrimary(async () => {
    const resA: number = await clusterPromise.run("a", 123);
    const resB: string = await clusterPromise.run("b", "abc");

    console.log(`easy as ${resA} simple as ${resB}`);
  });

  await sleep(1000);

  clusterPromise.shutdown();
};

run();
