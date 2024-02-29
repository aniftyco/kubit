import { ParsedTypedSchema, RequestValidatorNode, TypedSchema } from '@ioc:Kubit/Validator';

declare module '@ioc:Kubit/Request' {
  interface RequestContract {
    /**
     * Validate current request. The data is optional here, since request
     * can pre-fill it for us
     */
    validate<T extends ParsedTypedSchema<TypedSchema>>(validator: RequestValidatorNode<T>): Promise<T['props']>;
  }
}
