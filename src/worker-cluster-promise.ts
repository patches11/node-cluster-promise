import {
  ClusterPromiseWithRun,
  Functions,
  PrimaryMessage,
  WorkerMessage,
} from "./interfaces";
import process from "node:process";

export class WorkerClusterPromise<T extends Functions>
  implements ClusterPromiseWithRun
{
  functions: T;

  constructor(functions: T) {
    this.functions = functions;

    process.on("message", this.messageHandler);
  }
  private messageHandler = async (listenerArgs: WorkerMessage) => {
    if (listenerArgs.kind === "online") {
      this.primarySend({ kind: "ask" });
    } else {
      const { func, args, id } = listenerArgs;
      const f = this.functions[func];
      const result = await f(...args);
      this.primarySend({ kind: "result", result, id });
      this.primarySend({ kind: "ask" });
    }
  };

  primarySend(msg: PrimaryMessage) {
    if (process.send) {
      process.send(msg);
    } else {
      process.exit(1);
    }
  }

  run(funcName: string, args: any): Promise<any> {
    throw new Error("run on worker");
  }

  shutdown() {
    process.exit();
  }
}
