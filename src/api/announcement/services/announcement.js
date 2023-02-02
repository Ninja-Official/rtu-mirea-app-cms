"use strict";

/**
 * announcement service.
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::announcement.announcement",
  ({ strapi }) => ({
    async find(...args) {
      // Populate all relations
      const newArgs = [
        {
          fields: ["isImportant", "title", "text", "date"],
          populate: { tags: true, images: true },
        },
        ...args,
      ];

      const { results, pagination } = await super.find(...newArgs);

      return { results, pagination };
    },
  })
);
