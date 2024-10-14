const { QueryInterface, DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("Inventory", "productChildId", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Inventory", "productChildId");
  },
};
