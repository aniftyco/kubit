export abstract class Job<Payload extends Record<string, any>> {
  constructor(protected payload: Payload) {}

  public abstract handle(): Promise<void>;
}
