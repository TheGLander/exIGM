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

export const idSectionNames = [
	"Layout",
	"Buttons",
	"Buildings",
	"Upgrades",
	"Items",
	"Achievements",
	"Resources",
	"Shinies",
] as const
export type IdSectionName = typeof idSectionNames[number]

export interface IdSection extends SectionBase {
	name: IdSectionName
	values: IdDeclarationStatement<LangNode>
}

export interface LayoutSection extends IdSection {
	name: "Layout"
	useDefault: boolean
}

export function parseIdList<T extends LangNode>(
	tokens: Token[],
	valueHandler: (tokens: Token[]) => T
): IdDeclarationStatement<T>
export function parseIdList<T extends LangNode>(
	tokens: Token[],
	valueHandler: (tokens: Token[]) => T,
	allowedTags: string[]
): {
	foundTags: string[]
	value: IdDeclarationStatement<T>
}
export function parseIdList<T extends LangNode>(
	tokens: Token[],
	valueHandler: (tokens: Token[]) => T,
	allowedTags?: string[] | undefined
):
	| {
			foundTags: string[]
			value: IdDeclarationStatement<T>
	  } // Hi
	| IdDeclarationStatement<T> {
	const idListings: IdEntry<T>[] = []
	const foundTags: string[] = []
	const { eatToken, virtualEat, virtualEatOld } = tokenHelpers(tokens)
	while (tokens.length > 0) {
		let token = eatToken()
		if (token?.name === "section" || token?.name === "cssSection") {
			tokens.unshift(token)
			break
		}
		if (token?.name === "tag" && allowedTags?.includes(token.match)) {
			foundTags.push(token.match)
			continue
		}
		if (token?.name !== "thingKey") throw new ParseError("an id list", token)
		const names = token.match.substr(1).split("|")

		do token = virtualEat()
		while (
			token &&
			!(
				token.name === "thingKey" ||
				token.name === "section" ||
				token.name === "cssSection"
			)
		)
		const valueTokens = virtualEatOld()
		// Don't remove header if on final id
		if (tokens.length !== 0) tokens.unshift(valueTokens.pop() as Token) // I blame typescript
		idListings.push({
			name: "IdInstance",
			key: { name: "IdIdentifier", value: names },
			value: valueHandler(valueTokens),
		})
	}
	if (allowedTags)
		return {
			value: { name: "IdDeclaration", value: idListings },
			foundTags,
		}
	else
		return {
			name: "IdDeclaration",
			value: idListings,
		}
}
