import {describe, expect, test} from "@jest/globals";
import {ClusterPromise} from "./cluster-promise";
import {indexArray} from "./utils";
import cluster from "node:cluster";
import { clusterPromise } from "./cluster-promise-test-worker"

cluster.setupPrimary({
  exec: "node_modules/.bin/ts-node src/cluster-promise-test-worker.ts"
})

describe("ClusterPromise", () => {
  cluster.fork()
  console.log(cluster.settings)
  test("executes on separate processes", async () => {
    const primaryPid = process.pid

    const results = await Promise.all(indexArray(4).map(() => clusterPromise.run("test", {})))
    console.log(primaryPid)
    console.log(results)
    expect(results).toEqual(expect.not.arrayContaining([primaryPid]))

    clusterPromise.shutdown()
  })
})