<?php

namespace NiftyCo\Kubit;

class KubitManager
{
    /**
     * Whether a Kubit component resolves, across both the published and packaged
     * anonymous component paths.
     *
     * Laravel namespaces anonymous component paths by hashing the prefix, so the
     * view name is that hash rather than `kubit`.
     *
     * @see https://github.com/laravel/framework/pull/52301
     */
    public function componentExists(string $name): bool
    {
        return app('view')->exists($this->viewNamespace().'::'.$name);
    }

    public function viewNamespace(): string
    {
        return hash('xxh128', KubitTagCompiler::NAMESPACE);
    }
}
