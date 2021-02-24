import { parseEffectExpression } from "./expression"
import { tokenizeExpression } from "../tokens"

const AST = (str: string) => parseEffectExpression(tokenizeExpression(str))

it("should throw on binary operator before any value", () => {
	expect(() => AST(`+`)).toThrowError(
		"Expected a value before a binary operator at position 0, got '+'"
	)
})

it("should parse parentheses correctly", () => {
	expect(AST(`(((23))+45)*76`)).toStrictEqual({
		name: "EffectExpression",
		value: {
			left: {
				left: { name: "EffectExpressionNumber", value: 23 },
				name: "EffectExpressionBinaryOperator",
				operation: "+",
				right: { name: "EffectExpressionNumber", value: 45 },
			},
			name: "EffectExpressionBinaryOperator",
			operation: "*",
			right: { name: "EffectExpressionNumber", value: 76 },
		},
	})
})
