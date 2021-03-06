/*Important*/
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('test_cases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contract_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transaction_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expected_payload_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expected_payload_value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sc_event: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      success: {
          type: Sequelize.BOOLEAN,
          defaultValue: null,
      },
      params: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'userId',
        },
      },
      testSuiteId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'test_suites',
          key: 'id',
          as: 'testSuiteId',
        },
      },
    }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('test_cases'),
};
