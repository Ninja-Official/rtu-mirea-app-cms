'use strict';

/**
 * search-students-bot-person controller
 */

const { sanitizeEntity } = require('strapi-utils');

const { createCoreController } = require('@strapi/strapi').factories;

const typeEnum = Object.freeze({ request: 'request', query: 'query' });

module.exports = createCoreController('api::search-students-bot-person.search-students-bot-person', ({ strapi }) => ({

  async find(ctx) {
    const { query, userId, type } = ctx.request.query;
    const count = 30;

    if (query === undefined) {
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

    const data = await strapi.db.connection.context.raw(
      `SELECT limited_people.* FROM (
        SELECT people.* FROM (
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ~ LOWER(:query)
            OR LOWER(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(last_name, ' ', first_name)) ~ LOWER(:query)
            OR LOWER(CONCAT(first_name, ' ', last_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(last_name) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(first_name, ' ', middle_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER("group") ~ LOWER(:query))
        ) AS people
        LIMIT :count) as limited_people
      ORDER BY last_name, first_name, middle_name, "group"`,
      { query, count }
    ).then((res) => {return res.rows})
    meta.count = data.length;

    meta.total = await strapi.db.connection.context.raw(
      `SELECT COUNT(people.*) FROM (
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ~ LOWER(:query)
            OR LOWER(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(last_name, ' ', first_name)) ~ LOWER(:query)
            OR LOWER(CONCAT(first_name, ' ', last_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(last_name) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER(CONCAT(first_name, ' ', middle_name)) ~ LOWER(:query))
        UNION
          (SELECT * FROM search_students_bot_people
            WHERE LOWER("group") ~ LOWER(:query))
      ) AS people`,
      { query: query }
    ).then((res) => {return parseInt(res.rows[0].count)})

    const formattedData = data.map((person) => {
      return { id: person.id,
        attributes: {
          sdoId: person.sdo_id,
          lastName: person.last_name,
          firstName: person.first_name,
          middleName: person.middle_name,
          group: person.group,
          leaderidId: person.leaderid_id,
          phone: person.phone,
          birthday: person.birthday,
          vk_id: person.vk_id,
          personalEmail: person.personal_email,
          personalAddress: person.personal_address,
          inn: person.inn,
          snils: person.snils,
        }}
    });

    const permission = await strapi.db.query('api::search-students-bot-extended-access-permission.search-students-bot-extended-access-permission')
      .findOne(
        {
          select : ['id', 'requestExtendedAccess', 'queryExtendedAccess'],
          where: { telegramUserId: userId }
        },
      )

    if (permission === null ||
        (permission.requestExtendedAccess === false && type === typeEnum.request) ||
        (permission.queryExtendedAccess === false && type === typeEnum.query)
    ) {
      const allowedFields = [
        'sdoId', 'lastName', 'firstName', 'middleName', 'code',
        'group', 'birthday', 'vkId'
      ];

      // filter each item in data array by allowedFields
      const filteredData = formattedData.map(item => {
        const filteredItem = { id : item.id, attributes: {} };
        allowedFields.forEach(field => {
          filteredItem.attributes[field] = item.attributes[field];
        });
        return filteredItem;
      });

      return { data: filteredData, meta };
    }

    return { data: formattedData, meta };
  }
}));
