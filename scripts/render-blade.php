<?php

/**
 * Render every visual case as a standalone HTML page.
 *
 * The fixture is a renderer rather than a committed Laravel app: the cases only
 * need markup on a bare background, and both stacks link the *same* compiled
 * stylesheet so a pixel difference traces to structure rather than to two
 * different CSS builds.
 */

use BladeUI\Icons\BladeIconsServiceProvider;
use Illuminate\Support\Facades\Blade;
use Livewire\Blaze\BlazeServiceProvider;
use NiftyCo\Kubit\KubitServiceProvider;
use Orchestra\Testbench\Foundation\Application;
use secondnetwork\TablerIcons\BladeTablerIconsServiceProvider;

require __DIR__.'/../vendor/autoload.php';

$root = dirname(__DIR__);

$app = Application::create(
    basePath: $root.'/vendor/orchestra/testbench-core/laravel',
    options: ['extra' => ['providers' => [
        BladeIconsServiceProvider::class,
        BladeTablerIconsServiceProvider::class,
        BlazeServiceProvider::class,
        KubitServiceProvider::class,
    ]]],
);

$out = $root.'/tests/visual/build/blade';

@mkdir($out, 0755, true);

foreach (glob($root.'/tests/visual/cases/*.json') as $file) {
    $component = basename($file, '.json');
    $cases = json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);

    foreach ($cases as $case) {
        $attributes = '';

        foreach ($case['props'] ?? [] as $name => $value) {
            $attributes .= match (true) {
                $value === true => " {$name}",
                $value === false, $value === null => '',
                default => sprintf(' %s="%s"', $name, htmlspecialchars((string) $value, ENT_QUOTES)),
            };
        }

        $markup = sprintf(
            '<kubit:%s%s>%s</kubit:%s>',
            $component,
            $attributes,
            $case['slot'] ?? '',
            $component,
        );

        $html = Blade::render(page($markup));

        file_put_contents("{$out}/{$component}--{$case['name']}.html", $html);

        echo "blade: {$component}--{$case['name']}\n";
    }
}

/**
 * One case per page on a bare background, nothing but the component.
 */
function page(string $markup): string
{
    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="../fixture.css">
    </head>
    <body class="bg-surface p-8">
      <div data-kubit-case class="inline-block">{$markup}</div>
    </body>
    </html>
    HTML;
}
