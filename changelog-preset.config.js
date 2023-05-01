/**
 * Update changelog presets to use bitbucket format
 *
 * @see https://github.com/lerna/lerna/issues/2451
 * @see https://github.com/lerna/lerna/issues/2451#issuecomment-770672107
 *
 * ATTENTION: It is necessary to point to this config file, while running lerna command.
 *
 * Example: yarn lerna version --yes --conventional-commits --changelog-preset ./changelog-preset.config.js
 */

const config = require('conventional-changelog-conventionalcommits');
module.exports = config({
   // commitUrlFormat: "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
   // compareUrlFormat: "{{host}}/{{owner}}/{{repository}}/branches/compare/{{currentTag}}...{{previousTag}}"
});
