// TODO: STUB

import { LangNode } from "../astGen"
import { Token } from "../tokens"

export interface EffectStatement extends LangNode {
	name: "EffectStatement"
	value: string
}

/**
 * Converts a token into an effect
 */
export function parseEffect(string: Token): EffectStatement {
	return { name: "EffectStatement", value: string.match }
}
/*
  Tags
	/<(b|i|u|t|q|(?:#[\da-f]{3}))><\/\1>/
	/<(\/|\/\/|\.)>/
*/
