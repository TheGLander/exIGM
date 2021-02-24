import tokenize from "./tokens"
import { tokenizeExpression } from "./tokens"

describe("tokenize()", () => {
	it("should be able to tokenize simple syntax", () => {
		expect(
			tokenize(`Let's make a game!
test: test2`)
		).toStrictEqual([
			{ match: "Let's make a game!", name: "section", position: 0 },
			{ match: "test:", name: "key", position: 19 },
			{ match: "test2", name: "value", position: 25 },
		])
	})

	it("should be able to throw on invalid syntax", () => {
		expect(() => tokenize(`&1%1$`)).toThrowError(
			"Couldn't tokenize the code\nLeftover code: &1%1$"
		)
	})
})

describe("tokenizeExpression()", () => {
	it("should be able to tokenize simple syntax", () => {
		expect(tokenizeExpression("multiply yield of :All by 777*3")).toStrictEqual(
			[
				{ match: "multiply", name: "command", position: 0 },
				{ match: "yield of", name: "command", position: 17 },
				{ match: ":All", name: "something", position: 34 },
				{ match: "by", name: "command", position: 43 },
				{ match: "777", name: "number", position: 48 },
				{ match: "*", name: "binaryOperator", position: 54 },
				{ match: "3", name: "number", position: 56 },
			]
		)
	})

	it("should be able to throw on invalid syntax", () => {
		expect(() => tokenizeExpression(` `)).toThrowError(
			"Couldn't tokenize the code\nLeftover code:  "
		)
	})
})
