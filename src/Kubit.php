<?php

namespace NiftyCo\Kubit;

use Illuminate\Support\Facades\Facade;

/**
 * @method static bool componentExists(string $name)
 * @method static string viewNamespace()
 *
 * @see KubitManager
 */
class Kubit extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'kubit';
    }
}
