import {ClusterPromise} from "./cluster-promise";

const functions = {
  "test": async (): Promise<number> => {
    console.log("test")
    return process.pid
  }
}

export const clusterPromise = new ClusterPromise(functions, {workers: 4})