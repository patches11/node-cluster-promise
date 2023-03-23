
export const sleep = async (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

export const indexArray = (size: number): number[] => {
  return Array.from(Array(size).keys())
}

export const range = (from: number, to: number): number[] => {
  return indexArray(to - from).map(n => from + n)
}