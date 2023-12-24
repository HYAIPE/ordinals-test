import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

export async function handleBatchWrite(
  db: DynamoDBDocumentClient,
  input: BatchWriteCommandInput,
): Promise<void> {
  const MAX_BATCH_SIZE = 25;
  const MAX_ATTEMPTS = 10;
  let unprocessedItems = input.RequestItems;
  let attempts = 0;
  while (
    [...Object.values(unprocessedItems!)].flat().length > 0 &&
    attempts < MAX_ATTEMPTS
  ) {
    const batches = createBatches(unprocessedItems!, MAX_BATCH_SIZE);
    for (const batch of batches) {
      const batchInput: BatchWriteCommandInput = { RequestItems: batch };
      const response = await db.send(new BatchWriteCommand(batchInput));
      unprocessedItems = response.UnprocessedItems || {};
    }
    attempts++;
    await new Promise((resolve) =>
      setTimeout(resolve, 100 * attempts ** 2 + 1),
    );
  }

  if (attempts === MAX_ATTEMPTS) {
    throw new Error(
      `Failed to process batch write after ${MAX_ATTEMPTS} attempts. Unprocessed items: ${JSON.stringify(
        unprocessedItems,
      )}`,
    );
  }
}

export function createBatches(
  items: {
    [tableName: string]: Array<{
      PutRequest?: { Item: any };
      DeleteRequest?: { Key: any };
    }>;
  },
  maxSize: number,
): {
  [tableName: string]: Array<{
    PutRequest?: { Item: any };
    DeleteRequest?: { Key: any };
  }>;
}[] {
  const batches: {
    [tableName: string]: Array<{
      PutRequest?: { Item: any };
      DeleteRequest?: { Key: any };
    }>;
  }[] = [];
  let currentBatch: {
    [tableName: string]: Array<{
      PutRequest?: { Item: any };
      DeleteRequest?: { Key: any };
    }>;
  } = {};
  let currentSize = 0;

  for (const tableName in items) {
    for (const request of items[tableName]) {
      if (currentSize === maxSize) {
        batches.push(currentBatch);
        currentBatch = {};
        currentSize = 0;
      }

      if (!currentBatch[tableName]) {
        currentBatch[tableName] = [];
      }

      currentBatch[tableName].push(request);
      currentSize++;

      // Move this check to the end of the outer loop
    }

    // Check if the batch needs to be reset after finishing with one table
    if (currentSize === maxSize) {
      batches.push(currentBatch);
      currentBatch = {};
      currentSize = 0;
    }
  }

  // Add the last batch if it has any items
  if (currentSize > 0) {
    batches.push(currentBatch);
  }

  return batches;
}
