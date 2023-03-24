import {
  ClusterPromiseOptions,
  ClusterPromiseWithRun,
  Work,
  Functions,
  PrimaryMessage,
  WorkerMessage,
} from "./interfaces";
import { availableParallelism, cpus } from "node:os";
import cluster, { Worker } from "node:cluster";

export const getParallelismTarget = () => {
  try {
    return availableParallelism();
  } catch {
    return cpus().length;
  }
};

export class PrimaryClusterPromise<T extends Functions>
  implements ClusterPromiseWithRun
{
  workers: number;
  workerParallelism: number;
  currentId: bigint;
  functions: T;
  work: Work[];
  workInProgress: { [id: string]: Work };

  constructor(functions: T, options?: ClusterPromiseOptions) {
    this.workers = options?.workers || getParallelismTarget();
    this.workerParallelism = options?.workerParallelism || 1;
    this.functions = functions;
    this.work = [];
    this.workInProgress = {};
    this.currentId = BigInt(0);

    for (let i = 0; i < this.workers; i++) {
      cluster.fork();
    }

    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker) {
        worker.on("message", (msg) => {
          this.messageHandler(worker, msg);
        });
        worker.on("online", () => {
          this.workerSend(worker, { kind: "online" });
        });
      }
    }
  }

  private messageHandler = (worker: Worker, msg: PrimaryMessage) => {
    if (msg.kind === "ask") {
      const work = this.work.shift();
      if (work) {
        this.workerSend(worker, {
          kind: "worker-work",
          func: work.funcName,
          args: work.args,
          id: work.id,
        });
        this.workInProgress[work.id] = work;
      }
    } else {
      const { resolve } = this.workInProgress[msg.id];
      resolve(msg.result);
    }
  };

  private workerSend = (worker: Worker, msg: WorkerMessage) => {
    worker.send(msg);
  };

  private nextId(): string {
    const id = this.currentId++;
    return id.toString();
  }

  run(funcName: string, args: any): Promise<any> {
    const id = this.nextId();
    return new Promise((resolve, reject) => {
      this.work.push({ resolve, reject, funcName, args, id });
    });
  }

  shutdown() {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker) {
        worker.disconnect();
        worker.kill();
      }
    }
  }
}
