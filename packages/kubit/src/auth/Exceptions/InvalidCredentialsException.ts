import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { Exception } from '@poppinss/utils';

/**
 * Exception raised when unable to verify user credentials
 */
export class InvalidCredentialsException extends Exception {
  public guard: string;
  public responseText = this.message;

  /**
   * Unable to find user
   */
  public static invalidUid(guard: string) {
    const error = new this('User not found', 400, 'E_INVALID_AUTH_UID');
    error.guard = guard;
    return error;
  }

  /**
   * Invalid user password
   */
  public static invalidPassword(guard: string) {
    const error = new this('Password mis-match', 400, 'E_INVALID_AUTH_PASSWORD');
    error.guard = guard;
    return error;
  }

  /**
   * Send response as an array of errors
   */
  protected respondWithJson(ctx: HttpContextContract) {
    ctx.response.status(this.status).send({
      errors: [
        {
          message: this.responseText,
        },
      ],
    });
  }

  /**
   * Flash error message and redirect the user back
   */
  protected respondWithRedirect(ctx: HttpContextContract) {
    if (!ctx.session) {
      return ctx.response.status(this.status).send(this.responseText);
    }

    ctx.session.flashExcept(['_csrf']);
    ctx.session.flash('auth', {
      error: this.responseText,

      /**
       * Will be removed in the future
       */
      errors: {
        uid: this.code === 'E_INVALID_AUTH_UID' ? ['Invalid login id'] : null,
        password: this.code === 'E_INVALID_AUTH_PASSWORD' ? ['Invalid password'] : null,
      },
    });
    ctx.response.redirect('back', true);
  }

  /**
   * Send response as an array of errors formatted as per JSONAPI spec
   */
  protected respondWithJsonAPI(ctx: HttpContextContract) {
    ctx.response.status(this.status).send({
      errors: [
        {
          code: this.code,
          title: this.responseText,
          source: null,
        },
      ],
    });
  }

  /**
   * Self handle exception and attempt to make the best response based
   * upon the type of request
   */
  public async handle(_: InvalidCredentialsException, ctx: HttpContextContract) {
    /**
     * Use translation when using i18n
     */
    if ('i18n' in ctx) {
      this.responseText = ctx.i18n.formatMessage(`auth.${this.code}`, {}, this.message);
    }

    if (ctx.request.ajax()) {
      this.respondWithJson(ctx);
      return;
    }

    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'html':
      case null:
        this.respondWithRedirect(ctx);
        break;
      case 'json':
        this.respondWithJson(ctx);
        break;
      case 'application/vnd.api+json':
        this.respondWithJsonAPI(ctx);
        break;
    }
  }
}
