module.exports = (sequelize, DataTypes) => {
	const TestCase = sequelize.define('TestCase', {
		contract_hash: {
			type: DataTypes.STRING,
			allowNull: false
		},
		transaction_hash: {
			type: DataTypes.STRING,
			allowNull: true
		},
		event_type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expected_payload_type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expected_payload_value: {
			type: DataTypes.STRING,
			allowNull: false
		},
		sc_event: {
			type: DataTypes.STRING,
			allowNull: true
		},
		active: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		success: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		},

	}, {
		tableName: 'test_cases'
	});

	TestCase.associate = (models) => {
	    TestCase.belongsTo(models.TestSuite, {
	      foreignKey: 'testSuiteId',
	      onDelete: 'CASCADE',
	    });

		TestCase.belongsTo(models.User, {
	      foreignKey: 'userId',
	      onDelete: 'CASCADE',
	    });
  	};

	return TestCase;
};
