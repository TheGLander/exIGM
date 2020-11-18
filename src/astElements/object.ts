import { LangNode } from "../astGen"
import { parseString, StringInstance } from "./string"
import { EffectStatement, parseEffect } from "./effect"
import { Token } from "../tokens"
import tokenHelpers from "./helpers"
import { ParseError } from "../errors"

/**
 *  The name of a key in an object declaration ex.
 * `abc: def` `abc` is the object key
 */
export interface ObjectKey extends LangNode {
	name: "ObjectKey"
	value: string
}

export const effectKeys = ["on click", "passive", "on tick"] as const

export type EffectKeys = typeof effectKeys[number]

/**
 *  The name of an effect key in an object declaration ex.
 * `on click: def` `on click` is the object effect key
 */
export interface ObjectEffectKey extends ObjectKey {
	value: EffectKeys
}

export interface ObjectEntry<T extends StringInstance | EffectStatement>
	extends LangNode {
	name: "ObjectInstance"
	key: ObjectKey
	value: T
}

export interface ObjectPropertyStatement extends LangNode {
	name: "ObjectPropertyStatement"
	value: ObjectKey
}

export type StringObjectInstance = ObjectEntry<StringInstance>

export type EffectObjectInstance = ObjectEntry<EffectStatement>

export interface ObjectDeclaration extends LangNode {
	name: "ObjectDeclaration"
	value: (
		| EffectObjectInstance
		| StringObjectInstance
		| ObjectPropertyStatement
	)[]
}

export function parseLangObject(tokens: Token[]): ObjectDeclaration | null {
	const objListings: (
		| EffectObjectInstance
		| StringObjectInstance
		| ObjectPropertyStatement
	)[] = []
	const { eatToken } = tokenHelpers(tokens)
	while (tokens.length > 0) {
		const token = eatToken()
		if (token.name !== "key" && token.name !== "tag")
			throw new ParseError("an object", token)
		const name =
			token.name === "key"
				? token.match.substr(0, token.match.length - 1)
				: token.match
		if (token.name === "key") {
			const valueToken = eatToken()

			let value: StringInstance | EffectStatement = null

			if (effectKeys.some(val => val === name)) value = parseEffect(valueToken)
			else value = parseString(valueToken)

			objListings.push({
				name: "ObjectInstance",
				key: { name: "ObjectKey", value: name },
				value,
			} as EffectObjectInstance | StringObjectInstance)
		} else {
			objListings.push({
				name: "ObjectPropertyStatement",
				value: { name: "ObjectKey", value: name },
			})
		}
	}
	return { name: "ObjectDeclaration", value: objListings }
}
