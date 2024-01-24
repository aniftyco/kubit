/*
 * @kubit/mrm-preset
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = function (file, forced) {
  if (file.exists() && !forced) {
    return;
  }
  file.save();
};
