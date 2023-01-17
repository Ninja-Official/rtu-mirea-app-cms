'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/get-full-teacher-name',
      handler: 'search-students-bot-person.getFullName',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
