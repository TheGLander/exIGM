import { Token } from "../tokens"
import tokenHelpers from "./helpers"
import { SectionBase } from "../astGen"
import { LangNode } from "../astGen"
import { ParseError } from "../errors"
/**
 *  The name of an id in an id entry, ex
 * `*abc: def` `abc` is the id identifier
 */
export interface IdIdentifier extends LangNode {
	name: "IdIdentifier"
	value: string[]
}

/**
 * A single entry in an id list
 */
export interface IdEntry<T extends LangNode> extends LangNode {
	name: "IdInstance"
	key: IdIdentifier
	value: T
}

/**
 * The collection of Id entries
 */
export interface IdDeclarationStatement<T extends LangNode> extends LangNode {
	name: "IdDeclaration"
	value: IdEntry<T>[]
}

export type IdSectionName =
	| "Layout"
	| "Buttons"
	| "Buildings"
	| "Upgrades"
	| "Items"
	| "Achievements"
	| "Resources"
	| "Shinies"

export interface IdSection extends SectionBase {
	name: IdSectionName
	values: IdDeclarationStatement<LangNode>
}

export function parseIdList<T extends LangNode>(
	tokens: Token[],
	valueHandler: (tokens: Token[]) => T
): IdDeclarationStatement<T> | null {
	const idListings: IdEntry<T>[] = []
	const { eatToken, virtualEat, virtualEatOld } = tokenHelpers(tokens)
	while (tokens.length > 0) {
		let token = eatToken()
		if (token.name !== "thingKey") throw new ParseError("an id list", token)
		const names = token.match.substr(1).split("|")

		for (
			token = virtualEat();
			token && token.name !== "thingKey";
			token = virtualEat() // eslint-disable-next-line no-empty
		) {}
		const valueTokens = virtualEatOld()
		// Don't remove header if on final id
		if (tokens.length !== 0) tokens.unshift(valueTokens.pop())
		idListings.push({
			name: "IdInstance",
			key: { name: "IdIdentifier", value: names },
			value: valueHandler(valueTokens),
		})
	}
	return { name: "IdDeclaration", value: idListings }
}
