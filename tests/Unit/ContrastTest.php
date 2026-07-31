<?php

/**
 * A theme is valid when both of its modes satisfy the same contract:
 *
 * | Requirement                             | Threshold |
 * | --------------------------------------- | --------- |
 * | Text on a solid fill                    | 4.5:1     |
 * | A solid fill against the page behind it | 3:1       |
 * | A border against its surface            | 3:1       |
 *
 * These are theme-independent by design — the assertion validates whatever theme
 * is loaded, so a brand hue someone drops in is held to the same bar as the one
 * shipped. It is also what a theme editor checks against later.
 *
 * Satisfying the contract tends to move a hue in opposite directions between
 * modes: light wants a darker step under a light foreground, dark wants a lighter
 * and less saturated step under a dark one. No formula produces that, which is why
 * each pair is chosen rather than derived — and why this has to be asserted rather
 * than assumed.
 */
it('holds every solid variant above the contrast floor in both modes', function () {
    //
})->skip(
    'Pending the design system. kubit.css currently carries placeholder values, '.
    'so asserting against them would pin numbers nobody has chosen.'
);
