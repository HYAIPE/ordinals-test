import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name === "homestead") {
    return;
  }
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("TestAllowance", {
    from: deployer,
    log: true,
  });
};
func.tags = ["test"];
export default func;
