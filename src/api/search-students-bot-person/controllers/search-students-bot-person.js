'use strict';

/**
 * search-students-bot-person controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const typeEnum = Object.freeze({ request: 'request', query: 'query' });

module.exports = createCoreController('api::search-students-bot-person.search-students-bot-person', ({ strapi }) => ({

  async find(ctx) {
    const { query, userId, type } = ctx.request.query;
    const count = 30;

    if (!query) {
      return ctx.badRequest('Query is required');
    }
    if (query.length < 3) {
      return ctx.badRequest('Query must be at least 3 characters long');
    }
    if (userId === undefined) {
      return ctx.badRequest('User ID is required');
    }
    if (type === undefined) {
      return ctx.badRequest('Type is required');
    }

    let meta = { count };
    const lowerCaseQuery = query.toLowerCase();


    const data = await strapi.db.connection.context.raw(
      `SELECT limited_people.* FROM (
        SELECT id, sdo_id AS "sdoId", last_name AS "lastName", first_name AS "firstName",
          middle_name AS "middleName", email, "group",
          code, leaderid_id AS "leaderidId", phone,
          birthday, vk_id AS "vkId", personal_address AS "personalAddress",
          personal_email AS "personalEmail", inn, snils,
          job_title AS "jobTitle"
          FROM (
          (SELECT * FROM search_students_bot_people
            WHERE (LOWER(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ~ :query
              OR LOWER(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ~ :query
              OR LOWER(CONCAT(first_name, ' ', last_name)) ~ :query)
              AND (published_at IS NOT NULL))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER("group") ~ :query AND (published_at IS NOT NULL))
        ) AS people
        LIMIT :count) as limited_people
      ORDER BY "lastName", "firstName", "middleName", "group"`,
      { query : lowerCaseQuery, count : count }
    ).then((res) => {return res.rows.map((row) => {
      const { id, ...attributes } = row;
      return { id, attributes };
    })});
    meta.count = data.length;

    meta.total = await strapi.db.connection.context.raw(
      `SELECT COUNT(people.*) FROM (
          (SELECT * FROM search_students_bot_people
            WHERE (
            LOWER(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ~ :query
            OR LOWER(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ~ :query
            OR LOWER(CONCAT(first_name, ' ', last_name)) ~ :query)
            AND (published_at IS NOT NULL))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER("group") ~ :query AND (published_at IS NOT NULL))
      ) AS people`,
      { query : lowerCaseQuery }
    ).then((res) => {return parseInt(res.rows[0].count)})

    const permission = await strapi.db.query('api::search-students-bot-extended-access-permission.search-students-bot-extended-access-permission')
      .findOne(
        {
          select : ['id', 'requestExtendedAccess', 'queryExtendedAccess'],
          where: { $and: [{ telegramUserId: userId }, { published_at : { $not : null } }] }
        },
      )

    if (!permission ||
        (!permission.requestExtendedAccess && type === typeEnum.request) ||
        (!permission.queryExtendedAccess && type === typeEnum.query)
    ) {
      const allowedFields = [
        'lastName', 'firstName', 'middleName', 'code',
        'group', 'birthday', 'vkId', 'email', 'jobTitle'
      ];

      // filter each item in data array by allowedFields
      const filteredData = data.map(item => {
        const filteredItem = { id : item.id, attributes: {} };
        allowedFields.forEach(field => {
          filteredItem.attributes[field] = item.attributes[field];
        });
        return filteredItem;
      });
      return { data: filteredData, meta };
    }

    return { data, meta };
  },

}));
