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
		attachgasfeejs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		attachneojs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		attachgasjs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		wallet_invokejs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		invokehashjs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		invokeparamsjs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		gas_cost: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
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
