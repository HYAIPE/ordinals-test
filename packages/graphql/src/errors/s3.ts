export class UnableToGetS3ObjectError extends Error {
  constructor(bucket: string, key: string, reason: string) {
    super(`Unable to get S3 object: ${bucket}/${key} (${reason})`);
  }
}
