import cluster from "node:cluster";

import {
  ClusterPromiseOptions,
  ClusterPromiseWithRun,
  FunctionRecord,
  Function,
} from "./interfaces";
import { PrimaryClusterPromise } from "./primary-cluster-promise";
import { WorkerClusterPromise } from "./worker-cluster-promise";

export type inferRouteInput<TRoute extends Function<any, any>> =
  TRoute extends Function<infer Input, any> ? Input : never;

export class ClusterPromise<T extends FunctionRecord>
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

  addFunction<TPath extends string, TInput, TOutput>(
    path: TPath,
    f: Function<TInput, TOutput>
  ): ClusterPromise<T & Record<TPath, typeof f>> {
    return this;
  }

  run<
    Func extends keyof T,
    Return extends ReturnType<T[Func]>,
    Args extends inferRouteInput<T[Func]>
  >(funcName: Func, args: Args): Return {
    return this.inner.run(funcName as string, args) as any;
  }

  onPrimary(f: () => void) {
    if (cluster.isPrimary) {
      f();
    }
  }

  onWorker(f: () => void) {
    if (cluster.isWorker) {
      f();
    }
  }

  shutdown() {
    return this.inner.shutdown();
  }
}

export class FunctionRunner<
  T extends { [funcName: string]: (args: any) => any }
> {
  functions: T;

  constructor(functions: T) {
    this.functions = functions;
  }

  run(functionName: any, args: any): any {
    return (this.functions as any)[functionName].apply(args);
  }
}

const functions = {
  a: (n: number) => n,
  b: (s: string) => s,
};

const fr = new FunctionRunner(functions);

const resA = fr.run("a", 1);
const resB = fr.run("b", "test");
