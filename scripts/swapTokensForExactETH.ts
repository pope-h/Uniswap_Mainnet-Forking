import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wETHAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const Victim = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(Victim);
    const impersonatedSigner = await ethers.getSigner(Victim);

    const amountOut = ethers.parseUnits("2000000000000", 6);
    const amountInMax = ethers.parseEther("1");

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const wETH = await ethers.getContractAt("IERC20", wETHAdress);

    const uniswapRouter = await ethers.getContractAt("IUniswap", UNISwapRouter);

    const approveTx = await USDC.connect(impersonatedSigner).approve(UNISwapRouter, amountOut);
    await approveTx.wait();

    const ethBal = await impersonatedSigner.provider.getBalance(Victim);
    const wethBal = await wETH.balanceOf(Victim);
    const usdcBal = await USDC.balanceOf(Victim);
    const daiBal = await DAI.balanceOf(Victim);

    console.log("ETH Balance: ", ethers.formatEther(ethBal));
    console.log("WETH Balance: ", ethers.formatUnits(wethBal, 18));
    console.log("USDC Balance: ", ethers.formatUnits(usdcBal, 6));
    console.log("DAI Balance: ", ethers.formatUnits(daiBal, 18));

    const deadLine = Math.floor(Date.now() / 1000) + 60 * 20;

    const swapTx = await uniswapRouter.connect(impersonatedSigner).swapTokensForExactETH(
        amountOut,
        amountInMax,
        [USDCAddress, DAIAddress, wETHAdress],
        Victim,
        deadLine
    );
    await swapTx.wait();

    const usdcBalAfter = await USDC.balanceOf(Victim);
    const daiBalAfter = await DAI.balanceOf(Victim);
    const ethBalAfter = await impersonatedSigner.provider.getBalance(Victim);
    const wethBalAfter = await wETH.balanceOf(Victim);

    console.log("-----------------------------------------------------------------");

    console.log("eth balance after swap", ethers.formatEther(ethBalAfter));
    console.log("weth balance after swap", ethers.formatUnits(wethBalAfter, 18));
    console.log("usdc balance after swap", ethers.formatUnits(usdcBalAfter, 6));
    console.log("dai balance after swap", ethers.formatUnits(daiBalAfter, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});