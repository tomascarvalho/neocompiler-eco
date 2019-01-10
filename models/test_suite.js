module.exports = (sequelize, DataTypes) => {
    const TestSuite = sequelize.define('TestSuite', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'test_suites'
    });

    TestSuite.associate = (models) => {
        TestSuite.hasMany(models.TestCase, {
            foreignKey: 'testSuiteId',
            as: 'testCases',
        });
        TestSuite.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
        });
    };

    return TestSuite;
};
