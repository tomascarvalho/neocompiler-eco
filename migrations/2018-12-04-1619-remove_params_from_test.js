module.exports = {
    up: function(queryInterface, Sequelize) {
      // logic for transforming into the new state
      return queryInterface.removeColumn(
        'test_cases',
        'params',
      );
  
    },
  
    down: function(queryInterface, Sequelize) {
      // logic for reverting the changes
      return queryInterface.addColumn(
        'test_cases',
        'params',
        Sequelize.STRING,
      );
    }
  }