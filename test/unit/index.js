/**
 * Created by qhyang on 2018/5/17.
 */

// requires all tests in `project/test/src/components/**/index.js`
const tests = require.context('', true, /\.spec\.js$/);

tests.keys().forEach(tests);

// requires all components in `project/src/components/**/index.js`
const components = require.context('../../src/app/', true, /main\.js$/);

components.keys().forEach(components);
