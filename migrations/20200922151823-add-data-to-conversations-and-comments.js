'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Conversations', 'data', { type: Sequelize.JSONB });
    await queryInterface.addColumn('Comments', 'data', { type: Sequelize.JSONB });
    await queryInterface.addColumn('CommentHistories', 'data', { type: Sequelize.JSONB });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Conversations', 'data');
    await queryInterface.removeColumn('Comments', 'data');
    await queryInterface.removeColumn('CommentHistories', 'data');
  },
};
