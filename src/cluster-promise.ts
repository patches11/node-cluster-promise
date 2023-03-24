import cluster from "node:cluster";

import {
  ClusterPromiseOptions,
  ClusterPromiseWithRun,
  Functions,
} from "./interfaces";
import { PrimaryClusterPromise } from "./primary-cluster-promise";
import { WorkerClusterPromise } from "./worker-cluster-promise";

export class ClusterPromise<T extends Functions>
  implements ClusterPromiseWithRun
{
  inner: ClusterPromiseWithRun;

  constructor(functions: T, options?: ClusterPromiseOptions) {
    if (cluster.isPrimary) {
      this.inner = new PrimaryClusterPromise(functions, options);
    } else {
      this.inner = new WorkerClusterPromise(functions);
    }
  }

  run<K extends keyof T>(
    funcName: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]> {
    return this.inner.run(funcName as string, args) as any;
  }

  onPrimary(f: () => Promise<any>): Promise<any> {
    if (cluster.isPrimary) {
      return f();
    } else {
      return Promise.resolve();
    }
  }

  onWorker(f: () => Promise<any>): Promise<any> {
    if (cluster.isWorker) {
      return f();
    } else {
      return Promise.resolve();
    }
  }

  shutdown() {
    return this.inner.shutdown();
  }
}
