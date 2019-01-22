module.exports = {
    up: function(queryInterface, Sequelize) {
      // logic for transforming into the new state
      return queryInterface.addColumn(
        'test_cases',
        'gas_cost',
       Sequelize.INTEGER
      );
  
    },
  
    down: function(queryInterface, Sequelize) {
      // logic for reverting the changes
      return queryInterface.removeColumn(
        'test_cases',
        'gas_cost',
      );
    }
  }