'use strict';

/**
 * nfc-pass service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::nfc-pass.nfc-pass');
