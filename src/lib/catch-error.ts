export async function catchError<T>(promise: Promise<T>): Promise<[T, null] | [null, Error]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
