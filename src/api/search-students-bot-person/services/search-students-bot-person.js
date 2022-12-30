'use strict';

/**
 * search-students-bot-person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::search-students-bot-person.search-students-bot-person');
