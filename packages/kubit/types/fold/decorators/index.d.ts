/**
 * Injects bindings to the class constructor
 */
export declare function inject(value?: any): {
  (target: any, propertyKey: string): void;
  (target: any): void;
};
