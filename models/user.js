module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		token: {
			type: DataTypes.STRING,
			allowNull: true,
		}
	}, {
		tableName: 'users',
	},
	);

	User.associate = (models) => {
        User.hasMany(models.TestCase, {
            foreignKey: 'userId',
            as: 'testCases',
        });
    };

	User.associate = (models) => {
        User.hasMany(models.TestSuite, {
            foreignKey: 'userId',
            as: 'testSuites',
        });
    };
	return User;
};
