import {ClusterPromiseWithRun, Functions} from "./interfaces";
import process from "node:process";

export class WorkerClusterPromise<T extends Functions> implements ClusterPromiseWithRun {
  functions: T

  constructor(functions: T) {
    this.functions = functions

    process.on('message', this.messageHandler);
  }
  private messageHandler = async (listenerArgs: any) => {
    if (process.send) {
      if (listenerArgs.online) {
        process.send({ask: true});
      } else {
        const {func, args, id} = listenerArgs

        const f = this.functions[func]
        const result = await f(args)
        process.send({result, id});
        process.send({ask: true});
      }
    } else {
      process.exit(1)
    }
  }

  run(funcName: string, args: any): Promise<any> {
    throw new Error("run on worker")
  }

  shutdown() {
    process.exit()
  }
}