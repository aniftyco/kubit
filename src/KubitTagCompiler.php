<?php

namespace NiftyCo\Kubit;

use Illuminate\View\Compilers\ComponentTagCompiler;

/**
 * Compiles `<kubit:button />` tags.
 *
 * Laravel's ComponentTagCompiler hardcodes its tag regex to `x[-\:]`, so the three
 * matching methods are re-declared with `kubit[\:]` substituted and resolved names
 * prefixed `kubit::`. Structure and regex bodies follow Flux, which follows
 * Laravel's own ComponentTagCompiler. Both are MIT.
 */
class KubitTagCompiler extends ComponentTagCompiler
{
    /**
     * The Blade namespace both anonymous component paths are registered under.
     */
    public const NAMESPACE = 'kubit';

    /**
     * Rewrite `<kubit:button />` to `<x-kubit::button />` before anything else
     * compiles.
     *
     * Blaze's tokenizer only recognises the prefixes it ships with, so handing it
     * a `kubit:` tag leaves the call site uncompiled while the component file
     * still becomes a Blaze function, and the component renders as nothing. Giving
     * Blaze a prefix it already understands sidesteps that, and Laravel's own
     * component compiler does the real work from there.
     */
    public static function rewrite(string $value): string
    {
        $prefix = static::NAMESPACE;

        $value = preg_replace(
            '/<\s*'.$prefix.':([\w\-\.]+)/',
            '<x-'.$prefix.'::$1',
            $value
        );

        return preg_replace(
            '/<\/\s*'.$prefix.':([\w\-\.]+)\s*>/',
            '</x-'.$prefix.'::$1>',
            $value
        );
    }

    /**
     * Compile the opening tags within the given string.
     *
     * @return string
     *
     * @throws \InvalidArgumentException
     */
    protected function compileOpeningTags(string $value)
    {
        $pattern = "/
            <
                \s*
                kubit[\:]([\w\-\:\.]*)
                (?<attributes>
                    (?:
                        \s+
                        (?:
                            (?:
                                @(?:class)(\( (?: (?>[^()]+) | (?-1) )* \))
                            )
                            |
                            (?:
                                @(?:style)(\( (?: (?>[^()]+) | (?-1) )* \))
                            )
                            |
                            (?:
                                \{\{\s*\\\$attributes(?:[^}]+?)?\s*\}\}
                            )
                            |
                            (?:
                                (\:\\\$)(\w+)
                            )
                            |
                            (?:
                                [\w\-:.@%]+
                                (
                                    =
                                    (?:
                                        \\\"[^\\\"]*\\\"
                                        |
                                        \'[^\']*\'
                                        |
                                        [^\'\\\"=<>]+
                                    )
                                )?
                            )
                        )
                    )*
                    \s*
                )
                (?<![\/=\-])
            >
        /x";

        return preg_replace_callback($pattern, function (array $matches) {
            $this->boundAttributes = [];

            $attributes = $this->getAttributesFromAttributeString($matches['attributes']);

            return $this->componentString('kubit::'.$matches[1], $attributes);
        }, $value);
    }

    /**
     * Compile the self-closing tags within the given string.
     *
     * @return string
     *
     * @throws \InvalidArgumentException
     */
    protected function compileSelfClosingTags(string $value)
    {
        $pattern = "/
            <
                \s*
                kubit[\:]([\w\-\:\.]*)
                \s*
                (?<attributes>
                    (?:
                        \s+
                        (?:
                            (?:
                                @(?:class)(\( (?: (?>[^()]+) | (?-1) )* \))
                            )
                            |
                            (?:
                                @(?:style)(\( (?: (?>[^()]+) | (?-1) )* \))
                            )
                            |
                            (?:
                                \{\{\s*\\\$attributes(?:[^}]+?)?\s*\}\}
                            )
                            |
                            (?:
                                (\:\\\$)(\w+)
                            )
                            |
                            (?:
                                [\w\-:.@%]+
                                (
                                    =
                                    (?:
                                        \\\"[^\\\"]*\\\"
                                        |
                                        \'[^\']*\'
                                        |
                                        [^\'\\\"=<>]+
                                    )
                                )?
                            )
                        )
                    )*
                    \s*
                )
            \/>
        /x";

        return preg_replace_callback($pattern, function (array $matches) {
            $this->boundAttributes = [];

            $attributes = $this->getAttributesFromAttributeString($matches['attributes']);

            // Support inline "slot" attributes...
            if (isset($attributes['slot'])) {
                $slot = $attributes['slot'];

                unset($attributes['slot']);

                return '@slot('.$slot.') '.$this->componentString('kubit::'.$matches[1], $attributes)."\n@endComponentClass##END-COMPONENT-CLASS##".' @endslot';
            }

            return $this->componentString('kubit::'.$matches[1], $attributes)."\n@endComponentClass##END-COMPONENT-CLASS##";
        }, $value);
    }

    /**
     * Compile the closing tags within the given string.
     *
     * @return string
     */
    protected function compileClosingTags(string $value)
    {
        return preg_replace("/<\/\s*kubit[\:][\w\-\:\.]*\s*>/", ' @endComponentClass##END-COMPONENT-CLASS##', $value);
    }
}
