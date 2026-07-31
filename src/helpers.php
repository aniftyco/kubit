<?php

namespace NiftyCo\Kubit;

if (! function_exists('NiftyCo\Kubit\clsx')) {
    /**
     * Compose a class string, resolving Tailwind conflicts so the last value wins.
     *
     * Accepts strings, nested arrays, and conditional arrays keyed by class name:
     *
     *     clsx('inline-flex', ['bg-accent' => $isPrimary], $attributes->get('class'))
     *
     * Merging is what makes overriding predictable — a consumer's `text-lg`
     * displaces the component's `text-sm` instead of sitting beside it and winning
     * or losing on cascade order.
     */
    function clsx(mixed ...$classes): string
    {
        $list = toClassList($classes);

        if ($list === []) {
            return '';
        }

        return app('kubit.tailwind-merge')->merge(implode(' ', $list));
    }
}

if (! function_exists('NiftyCo\Kubit\toClassList')) {
    /**
     * Flatten clsx() input to an ordered list of class names.
     *
     * Order is preserved because the merge resolves conflicts left to right.
     *
     * @param  array<array-key, mixed>  $classes
     * @return list<string>
     *
     * @internal
     */
    function toClassList(array $classes): array
    {
        $list = [];

        foreach ($classes as $key => $value) {
            if (is_string($key)) {
                if ($value) {
                    $list[] = $key;
                }

                continue;
            }

            if ($value === null || $value === false || $value === '') {
                continue;
            }

            if (is_array($value)) {
                $list = [...$list, ...toClassList($value)];

                continue;
            }

            $list[] = (string) $value;
        }

        return $list;
    }
}
