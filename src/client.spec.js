import { bananas } from "./module.js";

/** @test {bananas} */
describe("bananas", () => {

	/** @test {bananas#defined} */
	it("is defined", () => {
		expect(bananas).toBeDefined();
	});

	/** @test {bananas#yes we have no} */
	it("yes, we have no bananas.", () => {
		expect(bananas).toBe(0);
	});
});

// eof
