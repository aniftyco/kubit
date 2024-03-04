import type { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * AdonisJS provider for registering japa class to the container
 */
export default class TestsProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.bind('Japa/Preset/Test', () => {
      const { Test } = require('@japa/runner');
      return Test;
    });

    this.app.container.bind('Japa/Preset/TestContext', () => {
      const { TestContext } = require('@japa/runner');
      return TestContext;
    });

    this.app.container.bind('Japa/Preset/Assert', () => {
      const { Assert } = require('@japa/assert');
      return Assert;
    });

    this.app.container.bind('Japa/Preset/ApiClient', () => {
      const { ApiClient } = require('@japa/api-client');
      return ApiClient;
    });

    this.app.container.bind('Japa/Preset/ApiRequest', () => {
      const { ApiRequest } = require('@japa/api-client');
      return ApiRequest;
    });

    this.app.container.bind('Japa/Preset/ApiResponse', () => {
      const { ApiResponse } = require('@japa/api-client');
      return ApiResponse;
    });
  }

  public boot() {
    this.app.container.withBindings(
      ['Kubit/Route', 'Japa/Preset/TestContext', 'Japa/Preset/ApiResponse'],
      (Route, TestContext, Response) => {
        TestContext.macro('route', function (routeIdentifier: string, params?: any, options?: any) {
          return Route.makeUrl(routeIdentifier, params, options);
        });

        Response.macro('assertRedirectsToRoute', function (routeIdentifier: string, params?: any, options?: any) {
          return this.assertRedirectsTo(Route.makeUrl(routeIdentifier, params, options));
        });
      }
    );
  }
}
