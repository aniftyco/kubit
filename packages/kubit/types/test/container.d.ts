declare module '@ioc:Kubit/Application' {
  import type { Assert } from '@japa/assert';
  import type { Test, TestContext } from '@japa/runner';
  import type { ApiRequest, ApiResponse, ApiClient } from '@japa/api-client';

  interface ContainerBindings {
    'Japa/Preset/Test': typeof Test;
    'Japa/Preset/TestContext': typeof TestContext;
    'Japa/Preset/Assert': typeof Assert;
    'Japa/Preset/ApiRequest': typeof ApiRequest;
    'Japa/Preset/ApiClient': typeof ApiClient;
    'Japa/Preset/ApiResponse': typeof ApiResponse;
  }
}
