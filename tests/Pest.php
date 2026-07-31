<?php

use PHPUnit\Framework\Assert;
use PHPUnit\Framework\ExpectationFailedException;
use Tests\TestCase;

uses(TestCase::class)->in('Feature', 'Unit');

/**
 * Blade wraps anything thrown during rendering in a ViewException, so asserting
 * that a component raised a specific error means walking the cause chain.
 */
expect()->extend('toThrowCausedBy', function (string $class) {
    try {
        ($this->value)();
    } catch (Throwable $thrown) {
        $causes = [];

        for ($cause = $thrown; $cause !== null; $cause = $cause->getPrevious()) {
            $causes[] = $cause::class;
        }

        Assert::assertContains(
            $class,
            $causes,
            "Expected [{$class}] in the cause chain, got: ".implode(' <- ', $causes)
        );

        return $this;
    }

    throw new ExpectationFailedException("Expected [{$class}] to be thrown, but nothing was.");
});
