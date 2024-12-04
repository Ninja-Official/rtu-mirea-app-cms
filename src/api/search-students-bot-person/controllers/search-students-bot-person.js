"use strict";

/**
 * search-students-bot-person controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const typeEnum = Object.freeze({ request: "request", query: "query" });

module.exports = createCoreController(
  "api::search-students-bot-person.search-students-bot-person",
  ({ strapi }) => ({
    async find(ctx) {
      const { query, userId, type } = ctx.request.query;

      if (!query) {
        return ctx.badRequest("Query is required");
      }
      if (query.length < 3) {
        return ctx.badRequest("Query must be at least 3 characters long");
      }
      if (userId === undefined) {
        return ctx.badRequest("User ID is required");
      }
      if (type === undefined) {
        return ctx.badRequest("Type is required");
      }

      // Check if user is blocked
      const block = await getBlock(userId);
      if (block) {
        return { data: [], meta: { count: 0, total: 0 } };
      }

      let limit = 0;
      if (type === typeEnum.request) {
        if (query.match("[ЁёA-Яa-я]{4}-[\\d]{2}-[\\d]{2}")) {
          limit = 40;
        } else {
          limit = 15;
        }
      } else if (type === typeEnum.query) {
        limit = 50;
      }

      let meta = {};

      const data = await strapi.db.connection.context
        .raw(
          `
SELECT id, sdo_id AS "sdoId", last_name AS "lastName", first_name AS "firstName",
  middle_name AS "middleName", email, "group",
  code, leaderid_id AS "leaderidId", phone,
  birthday, vk_id AS "vkId", personal_address AS "personalAddress",
  personal_email AS "personalEmail", inn, snils,
  job_title AS "jobTitle"
FROM search_students_bot_people
WHERE (CONCAT(last_name, ' ', first_name, ' ', middle_name) ~* :query
  OR CONCAT(first_name, ' ', middle_name, ' ', last_name) ~* :query
  OR CONCAT(first_name, ' ', last_name) ~* :query
  OR "group" ~* :query)
  AND published_at IS NOT NULL
ORDER BY "lastName", "firstName", "middleName", "group"
LIMIT :limit
`,
          { query, limit }
        )
        .then((res) => {
          return res.rows.map((row) => {
            const { id, ...attributes } = row;
            return { id, attributes };
          });
        });
      meta.count = data.length;

      meta.total = await strapi.db.connection.context
        .raw(
          `
SELECT COUNT(*) FROM search_students_bot_people
WHERE (CONCAT(last_name, ' ', first_name, ' ', middle_name) ~* :query
  OR CONCAT(first_name, ' ', middle_name, ' ', last_name) ~* :query
  OR CONCAT(first_name, ' ', last_name) ~* :query
  OR "group" ~* :query)
  AND published_at IS NOT NULL`,
          { query }
        )
        .then((res) => {
          return parseInt(res.rows[0].count);
        });

      const permission = await getPermission(userId);

      if (
        !permission ||
        (!permission.requestExtendedAccess && type === typeEnum.request) ||
        (!permission.queryExtendedAccess && type === typeEnum.query)
      ) {
        const allowedFields = [
          "lastName",
          "firstName",
          "middleName",
          "code",
          "group",
          "birthday",
          "vkId",
          "email",
          "jobTitle",
        ];

        // filter each item in data array by allowedFields
        const filteredData = data.map((item) => {
          const filteredItem = { id: item.id, attributes: {} };
          allowedFields.forEach((field) => {
            filteredItem.attributes[field] = item.attributes[field];
          });
          return filteredItem;
        });
        return { data: filteredData, meta };
      }

      return { data, meta };
    },

    async getFullTeacherName(ctx) {
      const { rawNames } = ctx.request.query;

      if (!rawNames) {
        return ctx.badRequest("Raw names are required");
      }
      const names = matchAll("[ЁёА-я]+\\ [ЁёА-я]\\.[ЁёА-я]", rawNames).slice(
        0,
        10
      );

      let result = [];
      for (const name of names) {
        const data = await strapi.db.connection.context
          .raw(
            `
SELECT DISTINCT ON ("lastName", "firstName", "middleName")
  last_name AS "lastName", first_name AS "firstName", middle_name AS "middleName"
FROM search_students_bot_people
WHERE email LIKE '%@mirea.ru'
  AND CONCAT(last_name, ' ', SUBSTR(first_name, 1, 1), '.', SUBSTR(middle_name, 1, 1)) = :name
  AND published_at IS NOT NULL
 LIMIT 10`,
            { name }
          )
          .then((res) => {
            return res.rows;
          });
        result.push({ rawName: name, possibleFullNames: data });
      }
      return result;
    },
  })
);

function matchAll(pattern, haystack) {
  var regex = new RegExp(pattern, "g");
  var matches = [];

  var match_result = haystack.match(regex);

  for (let index in match_result) {
    var item = match_result[index];
    matches[index] = item.match(regex)[0];
  }
  return matches;
}

async function getPermission(userId) {
  return await strapi.db
    .query(
      "api::search-students-bot-extended-access-permission.search-students-bot-extended-access-permission"
    )
    .findOne({
      select: ["id", "requestExtendedAccess", "queryExtendedAccess"],
      where: {
        $and: [{ telegramUserId: userId }, { published_at: { $not: null } }],
      },
    });
}

async function getBlock(userId) {
  return await strapi.db
    .query(
      "api::search-students-bot-access-block.search-students-bot-access-block"
    )
    .findOne({
      select: ["id"],
      where: {
        $and: [{ telegramUserId: userId }, { published_at: { $not: null } }],
      },
    });
}
