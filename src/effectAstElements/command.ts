import { LangNode } from "../astGen"
import { Token } from "../tokens"
import { EffectExpression, parseEffectExpression } from "./expression"
import { EffectSelector, parseEffectSelector } from "./selector"
import { ParseError } from "../errors"
import tokenHelpers from "../astElements/helpers"

export interface EffectCommand extends LangNode {
	name: "EffectCommand"
	commandName: string
}

export interface EffectMultCommand extends EffectCommand {
	commandName: "increase" | "lower" | "multiply"
	affectedProperty: "yield" | "cost" | "refund" | "frequency" | "duration"
	of: EffectSelector
	from?: EffectSelector
	amount: EffectExpression
}

const possibleCommands = ["increase", "lower", "multiply"]
const possibleAffectedProperties = [
	"yield of",
	"cost of",
	"refund of",
	"frequency of",
	"duration of",
]

export function parseEffectMultCommand(tokens: Token[]): EffectMultCommand {
	const { eatToken, peekToken } = tokenHelpers(tokens)
	const commandToken = eatToken()
	if (
		commandToken?.name !== "command" ||
		!possibleCommands.includes(commandToken.match)
	)
		throw new ParseError("an effect command", commandToken)
	const propertyToken = eatToken()
	if (
		propertyToken?.name !== "command" ||
		!possibleAffectedProperties.includes(propertyToken.match)
	)
		throw new ParseError("an effect command", propertyToken)
	const ofSelector = parseEffectSelector(tokens)
	let fromSelector: EffectSelector | undefined
	if (peekToken(0)?.name === "command" && peekToken(0)?.match === "from") {
		eatToken() // Eat the `from`
		fromSelector = parseEffectSelector(tokens)
	}

	const byToken = eatToken()
	if (byToken?.match !== "by") throw new ParseError('"by"', commandToken)

	const byValue = parseEffectExpression(tokens)

	return {
		name: "EffectCommand",
		// Dumb typescript
		// @ts-expect-error Type string is not assignable to bla bla bla
		commandName: commandToken.match,
		// @ts-expect-error Type string is not assignable to bla bla bla
		affectedProperty: propertyToken.match.substr(
			0,
			propertyToken.match.length - 3
		),
		//@ts-ignore
		amount: byValue,
		of: ofSelector,
		from: fromSelector,
	}
}
