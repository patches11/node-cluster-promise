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
  run: (funcName: string, args: any) => Promise<any>;
  shutdown: () => void;
}

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = { [key: string]: JsonValue };

export type JsonArray = JsonValue[];

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type Function<TInput = unknown, TOutput = unknown> = (
  opts: TInput
) => Promise<TOutput>;

export type FunctionRecord<TInput = unknown, TOutput = unknown> = Record<
  string,
  Function<TInput, TOutput>
>;

export type GetFirstArgumentOfAnyFunction<T> = T extends (
  first: infer FirstArgument,
  ...args: any[]
) => any
  ? FirstArgument
  : never;
