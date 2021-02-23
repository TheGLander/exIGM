import { LangNode } from "../astGen"
import { Token } from "../tokens"
import { ParseError } from "../errors"

const effectSelectorCategories = [
	"Resources",
	"Buttons",
	"Buildings",
	"Upgrades",
	"Achievements",
	"Items",
	"Shinies",
]

type EffectSelectorCategory =
	| "resources"
	| "buttons"
	| "buildings"
	| "upgrades"
	| "achievements"
	| "items"
	| "shinies"

export interface EffectSelector extends LangNode {
	name: "EffectSelector"
	tags: string[]
	notTags: string[]
	ownedState?: boolean | null
	all?: boolean
	categories: EffectSelectorCategory[]
	selectorKey?: string | null
}

export function parseEffectSelector(tokens: Token[]): EffectSelector {
	const token = tokens.shift()
	if (!token) throw new ParseError("anything", null)
	const selectorText = token.match

	const argumentRegex = /:(\w+)/g

	const tags: string[] = []
	const notTags: string[] = []
	const categories: EffectSelectorCategory[] = []
	let selectAll = false
	let ownedState: boolean | null = null

	const selectorKey = selectorText.match(/^\w+/)?.[1]
	const getNextTagValue = () => argumentRegex.exec(selectorText)?.[1]
	let segment = getNextTagValue()
	while (segment) {
		switch (segment) {
			case "tag":
			case "notTag": {
				const tagName = getNextTagValue()
				if (!tagName) throw new ParseError("a tag", token)
				if (segment === "tag") tags.push(tagName)
				else notTags.push(tagName)
				break
			}
			case "owned":
			case "notOwned":
				ownedState = segment === "owned"
				break
			case "All":
				selectAll = true
				break
			default:
				if (effectSelectorCategories.includes(segment))
					// Trust mah
					categories.push(segment.toLowerCase() as EffectSelectorCategory)
				else throw new ParseError("a valid selector segment", token)
		}

		segment = getNextTagValue()
	}
	return {
		name: "EffectSelector",
		tags,
		notTags,
		categories,
		selectorKey,
		ownedState,
		all: selectAll,
	}
}
