// TODO: STUB

import { LangNode } from "../astGen"
import { Token } from "../tokens"

export interface EffectStatement extends LangNode {
	name: "StringInstance"
	value: string
}

/**
 * Converts a token into a string instance
 */
export function parseString(string: Token): EffectStatement {
	return { name: "StringInstance", value: string.match }
}
/*
  Tags
	/<(b|i|u|t|q|(?:#[\da-f]{3}))><\/\1>/
	/<(\/|\/\/|\.)>/
*/
