// TODO: STUB

import { LangNode } from "../astGen"
import { Token, tokenizeExpression } from "../tokens"
import { parseEffectMultCommand } from "../effectAstElements/command"

export interface EffectStatement extends LangNode {
	name: "EffectStatement"
	effectAST: LangNode
}

/**
 * Converts a token into an effect
 */
export function parseEffect(string: Token): EffectStatement {
	return {
		name: "EffectStatement",
		effectAST: parseEffectMultCommand(tokenizeExpression(string.match)),
	}
}
/*
  Tags
	/<(b|i|u|t|q|(?:#[\da-f]{3}))><\/\1>/
	/<(\/|\/\/|\.)>/
*/
