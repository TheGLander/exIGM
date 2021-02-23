import { LangNode } from "../astGen"
import { Token } from "../tokens"
import { ParseError } from "../errors"
import tokenHelpers from "../astElements/helpers"

type EffectExpressionValue =
	| EffectExpressionBinaryOperator
	| EffectExpressionUnaryOperator
	| EffectExpressionAbsoluteValue

type EffectExpressionAbsoluteValue =
	| EffectExpressionNumber
	| EffectExpressionSelector

export interface EffectExpressionNumber {
	name: "EffectExpressionNumber"
	value: number
}

export interface EffectExpressionSelector {
	name: "EffectExpressionSelector"
	keyname: string
	objectKey?: string
}

export interface EffectExpressionBinaryOperator extends LangNode {
	name: "EffectExpressionBinaryOperator"
	left: EffectExpressionValue
	right: EffectExpressionValue
	operation: string
}

export interface EffectExpressionUnaryOperator extends LangNode {
	name: "EffectExpressionBinaryOperator"
	value: EffectExpressionValue
	operation: string
}

export interface EffectExpression extends LangNode {
	name: "EffectExpression"
	value: EffectExpressionValue
}

const orderOfOperation = [
	"!",
	"^",
	"*",
	"/",
	"%",
	"+",
	"-",
	"<",
	"<=",
	">",
	">=",
	"==",
	"!=",
	"is",
	"and",
	"or",
]

type PendingOperation = [EffectExpressionValue, string]

export function parseEffectExpression(tokens: Token[]): EffectExpression {
	function buildValueAST(tokens: Token[]): EffectExpressionValue {
		let currentOperations: PendingOperation[] = []
		let currentExpression: EffectExpressionValue | null = null
		const { eatToken, virtualEat, virtualEatOld } = tokenHelpers(tokens)
		while (tokens.length !== 0) {
			const currentToken = eatToken()
			if (!currentToken) throw new ParseError("anything", null)
			switch (currentToken.name) {
				case "parenthese": {
					let searchedToken: Token
					let paretheseDepth = 0
					// eslint-disable-next-line no-constant-condition
					while (true) {
						if (tokens.length === 0)
							throw new ParseError("closing parenthese", null)
						const tempSearchedToken = virtualEat()
						if (!tempSearchedToken) throw new ParseError("anything", null)
						searchedToken = tempSearchedToken
						if (searchedToken.match === "(") paretheseDepth++
						if (searchedToken.match === ")")
							if (paretheseDepth !== 0) paretheseDepth--
							else break
					}
					const tokensToParse = virtualEatOld()
					tokensToParse.pop() // Remove the final )
					currentExpression = buildValueAST(tokensToParse)
					break
				}
				case "number":
					currentExpression = {
						name: "EffectExpressionNumber",
						value: parseInt(currentToken.match),
					}
					break
				case "binaryOperator":
					if (!currentExpression)
						throw new ParseError(
							"a value before a binary operator",
							currentToken
						)
					if (currentOperations.length === 0)
						currentOperations = [[currentExpression, currentToken.match]]
					else {
						if (
							orderOfOperation.indexOf(currentToken.match) <
							orderOfOperation.indexOf(
								currentOperations[currentOperations.length - 1][1]
							)
						)
							currentOperations.push([currentExpression, currentToken.match])
						else {
							const completeOperation = currentOperations.pop() as PendingOperation
							currentOperations.push([
								{
									name: "EffectExpressionBinaryOperator",
									operation: completeOperation[1],
									left: completeOperation[0],
									right: currentExpression,
								},
								currentToken.match,
							])
						}
					}
					currentExpression = null

					break

				default:
					throw new ParseError("a valid expression", currentToken)
			}
		}
		if (currentExpression && currentOperations.length !== 0) {
			let completeOperation = currentOperations.pop()
			while (completeOperation) {
				currentExpression = {
					name: "EffectExpressionBinaryOperator",
					operation: completeOperation[1],
					left: completeOperation[0],
					right: currentExpression,
				}
				completeOperation = currentOperations.pop()
			}
		}

		if (!currentExpression)
			throw new ParseError("a complete expression", tokens[0] ?? null)
		return currentExpression
	}

	return { name: "EffectExpression", value: buildValueAST(tokens) }
}
