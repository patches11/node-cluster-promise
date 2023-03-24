export interface Work {
  funcName: string;
  id: string;
  args: any;
  resolve: (r: any) => void;
  reject: (e: Error) => void;
}

export interface ClusterPromiseOptions {
  workers?: number;
  workerParallelism?: number;
}

export interface ClusterPromiseWithRun {
  run: (funcName: string, ...args: any) => Promise<any>;
  shutdown: () => void;
}

export type Functions = {
  [functionName: string]: (...args: any) => Promise<any>;
};

export type Online = { kind: "online" };

export type WorkerWork = {
  kind: "worker-work";
  func: string;
  args: any[];
  id: string;
};

export type WorkerMessage = Online | WorkerWork;

export type Ask = { kind: "ask" };

export type Result = {
  kind: "result";
  id: string;
  result: any;
};

export type PrimaryMessage = Ask | Result;
