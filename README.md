# Node Cluster Promise

An easy way to make use of multiple cores.

## Why you might need this

* You are running in an environment where you have access to multiple cores, and do not want to deal with coordinating between individual NodeJS instances
* Your workload is CPU bound

## Why you might not need this

* In a cloud environment such as kubernetes, you may be better off running many individual NodeJS instances
* If you are actually limited by network wait, etc.
* If the overhead of message passing negates any gains you might see

## Example Usage

```typescript
import { ClusterPromise, sleep } from "cluster-promise";

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
```
