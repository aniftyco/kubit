import '@japa/api-client';

declare module '@japa/api-client' {
  export interface ApiRequest {
    /**
     * Define encrypted cookie
     */
    encryptedCookie(key: string, value: any): this;

    /**
     * Define plain cookie
     */
    plainCookie(key: string, value: any): this;
  }
}
