import { createBatches } from "./retryUnprocessedBatchWrite.js";

describe("createBatches", () => {
  const maxSize = 25;

  test("should handle a single table with fewer items than max size", () => {
    const items = {
      Table1: new Array(10).fill({ PutRequest: { Item: {} } }),
    };

    const batches = createBatches(items, maxSize);
    expect(batches.length).toBe(1);
    expect(batches[0]["Table1"].length).toBe(10);
  });

  test("should handle a single table with exactly max size items", () => {
    const items = {
      Table1: new Array(maxSize).fill({ PutRequest: { Item: {} } }),
    };

    const batches = createBatches(items, maxSize);
    expect(batches.length).toBe(1);
    expect(batches[0]["Table1"].length).toBe(maxSize);
  });

  test("should handle a single table with more items than max size", () => {
    const items = {
      Table1: new Array(maxSize + 10).fill({ PutRequest: { Item: {} } }),
    };

    const batches = createBatches(items, maxSize);
    expect(batches.length).toBe(2);
    expect(batches[0]["Table1"].length).toBe(maxSize);
    expect(batches[1]["Table1"].length).toBe(10);
  });

  test("should handle multiple tables with varying number of items", () => {
    const items = {
      Table1: new Array(20).fill({ PutRequest: { Item: {} } }),
      Table2: new Array(30).fill({ DeleteRequest: { Key: {} } }),
    };

    const batches = createBatches(items, maxSize);

    expect(batches.length).toBe(2);
    expect(batches[0]["Table1"].length).toBe(20);
    expect(batches[0]["Table2"].length).toBe(5);
    expect(batches[1]["Table2"].length).toBe(maxSize);
  });

  test("should handle multiple tables with varying number of items 2", () => {
    const items = {
      Table1: new Array(20).fill({
        PutRequest: { Item: {} },
      }),
      Table2: new Array(30).fill({
        DeleteRequest: { Key: {} },
      }),
    };

    const batches = createBatches(items, maxSize);

    expect(batches.length).toBe(2);
    expect(batches[0]["Table1"].length).toBe(20);
    expect(batches[0]["Table2"].length).toBe(5);
    expect(batches[1]["Table2"].length).toBe(maxSize);
  });
});
