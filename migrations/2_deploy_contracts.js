const DecentralizedBank = artifacts.require("DecentralizedBank");

module.exports = function (deployer) {
  deployer.deploy(DecentralizedBank);
};
