'use strict';

/**
 * nfc-pass router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::nfc-pass.nfc-pass');
