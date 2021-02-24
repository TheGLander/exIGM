import tokenHelpers from "./helpers"
import { Token } from "../tokens"
it("helpers return null", () => {
	const helpers = tokenHelpers([])
	expect(helpers.eatToken()).toBeNull()
	expect(helpers.peekToken(0)).toBeNull()
	expect(helpers.virtualEat()).toBeNull()
})

const placeholderToken: Token = {
	match: "PLACEHOLDER",
	name: "PLACEHOLDER",
	position: -1,
}

it("virtualEatOld stops on empty tokens", () => {
	const helpers = tokenHelpers([placeholderToken, placeholderToken])
	helpers.virtualEat()
	helpers.virtualEat()
	helpers.virtualEat()
	helpers.virtualEat()
	helpers.virtualEatOld()
})
