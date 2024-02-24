import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wETHAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const victim = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(victim);
    const impersonateSigner = await ethers.getSigner(victim);

    const amountUSDCDesired = ethers.parseUnits("5000", 6);
    const amountDAIDesired = ethers.parseUnits("5000", 18); 

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", wETHAdress);
    const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

    const approveUSDCTx = await USDC.connect(impersonateSigner).approve(UNISwapRouter, amountUSDCDesired);
    await approveUSDCTx.wait();

    const approveDAITx = await DAI.connect(impersonateSigner).approve(UNISwapRouter, amountDAIDesired);
    await approveDAITx.wait();

    const usdcBal = await USDC.balanceOf(victim);
    const daiBal = await DAI.balanceOf(victim);
    const wethBal = await WETH.balanceOf(victim);
    const ethBal = await impersonateSigner.provider.getBalance(victim);

    console.log("USDC Balance: ", ethers.formatUnits(usdcBal, 6));
    console.log("DAI Balance: ", ethers.formatUnits(daiBal, 18));
    console.log("WETH Balance: ", ethers.formatUnits(wethBal, 18));
    console.log("ETH Balance: ", ethers.formatEther(ethBal));

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const addLiquidityTx = await ROUTER.connect(impersonateSigner).addLiquidity(
        USDCAddress,
        DAIAddress,
        amountUSDCDesired,
        amountDAIDesired,
        0,
        0,
        victim,
        deadline
    );
    await addLiquidityTx.wait();

    const usdcBalAfter = await USDC.balanceOf(victim);
    const daiBalAfter = await DAI.balanceOf(victim);
    const wethBalAfter = await WETH.balanceOf(victim);
    const ethBalAfter = await impersonateSigner.provider.getBalance(victim);

    console.log("-----------------------------------------------------------------");
    console.log("USDC Balance After: ", ethers.formatUnits(usdcBalAfter, 6));
    console.log("DAI Balance After: ", ethers.formatUnits(daiBalAfter, 18));
    console.log("WETH Balance After: ", ethers.formatUnits(wethBalAfter, 18));
    console.log("ETH Balance After: ", ethers.formatEther(ethBalAfter));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});