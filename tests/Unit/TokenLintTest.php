<?php

use Symfony\Component\Finder\Finder;

/**
 * Every visual decision routes through a token, which is what makes replacing the
 * `@theme` block reskin Kubit completely. A raw palette utility sails through
 * cross-stack comparison — both stacks are wrong in the same way — so it has to
 * be caught statically, and in both stacks: a hardcoded colour in a `.tsx`
 * component is the same defect as one in a `.blade.php` component.
 */
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const PROPERTIES = 'bg|text|border|ring|outline|shadow|fill|stroke|from|via|to|decoration|caret|divide|placeholder|accent';

/**
 * A raw colour reaches an element three ways: a palette step, one of the two
 * palette endpoints that carry no step, or an arbitrary value that skips the
 * palette altogether. All three bypass the theme.
 */
const RAW_COLOR = '/\b(?:'.PROPERTIES.')-(?:(?:'.PALETTE.')-\d{2,3}|white|black|\[[^\]\s]+\])/';

/**
 * Both component sets, addressed by their path from the repository root so an
 * offence names the file a reader can open.
 *
 * @return list<array{string, string}>
 */
function componentSources(): array
{
    $root = dirname(__DIR__, 2);

    $directories = array_values(array_filter(
        [$root.'/stubs', $root.'/react/src'],
        fn (string $directory) => is_dir($directory)
    ));

    if ($directories === []) {
        return [];
    }

    $files = Finder::create()
        ->files()
        ->in($directories)
        ->name('*.blade.php')
        ->name('*.tsx')
        ->name('*.ts');

    $sources = [];

    foreach ($files as $file) {
        $sources[] = [
            ltrim(str_replace($root, '', $file->getPathname()), '/'),
            $file->getContents(),
        ];
    }

    return $sources;
}

it('covers both component sets', function () {
    $names = array_column(componentSources(), 0);

    expect($names)
        ->toContain('stubs/resources/views/kubit/button.blade.php')
        ->toContain('react/src/Button.tsx');
});

it('uses no raw colour in any component', function () {
    $offenders = [];

    foreach (componentSources() as [$name, $contents]) {
        foreach (explode("\n", $contents) as $number => $line) {
            preg_match_all(RAW_COLOR, $line, $matches);

            foreach ($matches[0] as $match) {
                $offenders[] = $name.':'.($number + 1).' — '.$match;
            }
        }
    }

    expect($offenders)->toBe([], 'Raw colours bypass the theme. Use a token instead: '.PHP_EOL.implode(PHP_EOL, $offenders));
});

it('confines emerald to the theme file', function () {
    foreach (componentSources() as [$name, $contents]) {
        expect($contents)->not->toContain('emerald', "[{$name}] names the accent palette directly.");
    }
})->skip(fn () => componentSources() === [], 'No components yet.');
