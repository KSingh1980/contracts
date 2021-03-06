var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('DonationWallet', function(accounts) {
	var token;
	var wallet;
	var projectCatalog;
	var donor = accounts[0];

	before("register project in catalog", async function () {
		var project = await Project.deployed();
		projectCatalog = await ProjectCatalog.new();
		projectCatalog.addProject("PROJECT", project.address);
		wallet = await DonationWallet.new(projectCatalog.address);
	});

	it("should deposit tokens to donation wallet", async function() {
		token = await AliceToken.deployed();

	  await token.mint(wallet.address, 100);

	  (await wallet.balance(token.address)).should.be.bignumber.equal(100);
	});

	it("should refund outstanding tokens", async function() {
		await wallet.refund(token.address, 50);

		(await wallet.balance(token.address)).should.be.bignumber.equal(50);
		(await token.balanceOf(donor)).should.be.bignumber.equal(50);
	});

	it("should donate from wallet", async function() {
		await wallet.donate(token.address, 50, "PROJECT");

		var projectAddress = await projectCatalog.getProjectAddress("PROJECT");
		var project = Project.at(projectAddress);
		(await wallet.balance(token.address)).should.be.bignumber.equal(0);
		(await project.getBalance(donor)).should.be.bignumber.equal(50);
	});



});
