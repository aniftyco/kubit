/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application';
import { LucidProviderConfig, LucidProviderContract, LucidProviderModel, ProviderUserContract } from '@ioc:Kubit/Auth';
import { QueryClientContract } from '@ioc:Kubit/Lucid/Database';
import { ModelQueryBuilderContract } from '@ioc:Kubit/Lucid/Orm';
import { Hooks } from '@poppinss/hooks';
import { esmResolver } from '@poppinss/utils';

import { LucidUser } from './User';

/**
 * Lucid provider uses Lucid models to lookup a users
 */
export class LucidProvider implements LucidProviderContract<LucidProviderModel> {
  /**
   * Hooks reference
   */
  private hooks = new Hooks();

  /**
   * Custom connection or query client
   */
  private connection?: string | QueryClientContract;

  constructor(
    private application: ApplicationContract,
    private config: LucidProviderConfig<LucidProviderModel>
  ) {}

  /**
   * The models options for constructing a query
   */
  private getModelOptions() {
    if (typeof this.connection === 'string') {
      return { connection: this.connection };
    }

    if (this.connection) {
      return { client: this.connection };
    }

    return this.config.connection ? { connection: this.config.connection } : {};
  }

  /**
   * Returns the auth model
   */
  private async getModel(): Promise<LucidProviderModel> {
    const model = await this.config.model();
    return esmResolver(model);
  }

  /**
   * Returns query instance for the user model
   */
  private async getModelQuery(model?: LucidProviderModel) {
    model = model || (await this.getModel());
    return {
      query: model.query(this.getModelOptions()),
    };
  }

  /**
   * Executes the query to find the user, calls the registered hooks
   * and wraps the result inside [[ProviderUserContract]]
   */
  private async findUser(query: ModelQueryBuilderContract<LucidProviderModel>) {
    await this.hooks.exec('before', 'findUser', query);

    const user = await query.first();
    if (user) {
      await this.hooks.exec('after', 'findUser', user);
    }

    return this.getUserFor(user);
  }

  /**
   * Returns an instance of the [[ProviderUser]] by wrapping lucid model
   * inside it
   */
  public async getUserFor(user: InstanceType<LucidProviderModel> | null) {
    const UserBuilder = this.config.user ? esmResolver(await this.config.user()) : LucidUser;
    return this.application.container.makeAsync(UserBuilder, [user, this.config]);
  }

  /**
   * Define custom connection
   */
  public setConnection(connection: string | QueryClientContract): this {
    this.connection = connection;
    return this;
  }

  /**
   * Define before hooks. Check interface for exact type information
   */
  public before(event: 'findUser', callback: (query: any) => Promise<void>): this {
    this.hooks.add('before', event, callback);
    return this;
  }

  /**
   * Define after hooks. Check interface for exact type information
   */
  public after(event: 'findUser', callback: (...args: any[]) => Promise<void>): this {
    this.hooks.add('after', event, callback);
    return this;
  }

  /**
   * Returns a user instance using the primary key value
   */
  public async findById(id: string | number) {
    const { query } = await this.getModelQuery();
    return this.findUser(query.where(this.config.identifierKey, id));
  }

  /**
   * Returns a user instance using a specific token type and value
   */
  public async findByRememberMeToken(id: string | number, value: string) {
    const { query } = await this.getModelQuery();
    return this.findUser(query.where(this.config.identifierKey, id).where('rememberMeToken', value));
  }

  /**
   * Returns the user instance by searching the uidValue against
   * their defined uids.
   */
  public async findByUid(uidValue: string) {
    const model = await this.getModel();

    /**
     * Use custom function on the model. This time, we do not emit
     * an event, since the user custom lookup may not even
     * run a query at all.
     */
    if (typeof model.findForAuth === 'function') {
      const user = await model.findForAuth(this.config.uids, uidValue);
      return this.getUserFor(user);
    }

    /**
     * Lookup by running a custom query.
     */
    const { query } = await this.getModelQuery();
    this.config.uids.forEach((uid) => query.orWhere(uid, uidValue));
    return this.findUser(query);
  }

  /**
   * Updates the user remember me token. The guard must called `setRememberMeToken`
   * before invoking this method.
   */
  public async updateRememberMeToken(providerUser: ProviderUserContract<InstanceType<LucidProviderModel>>) {
    /**
     * Extra check to find malformed guards
     */
    if (!providerUser.user!.$dirty.rememberMeToken) {
      throw new Error(
        'The guard must called "setRememberMeToken" before calling "updateRememberMeToken" on the Lucid provider'
      );
    }

    await providerUser.user!.save();
  }
}
