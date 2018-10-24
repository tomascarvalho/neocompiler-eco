/* jshint indent: 1 */

module.exports = (sequelize, DataTypes) => {
	const TestCase = sequelize.define('TestCase', {
		contract_hash: {
			type: DataTypes.STRING,
			allowNull: true
		},
		transaction_hash: {
			type: DataTypes.STRING,
			allowNull: true
		},
		event_type: {
			type: DataTypes.STRING,
			allowNull: true
		},
		expected_payload_type: {
			type: DataTypes.STRING,
			allowNull: true
		},
		expected_payload_value: {
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
		}
	}, {
		tableName: 'test_cases'
	});
	return TestCase;
};
