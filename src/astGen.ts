import {
	IdSection,
	IdSectionName,
	LayoutSection,
	parseIdList,
} from "./astElements/idList"
import { ObjectDeclaration, parseLangObject } from "./astElements/object"
import { Token } from "./tokens"
import tokenHelpers from "./astElements/helpers"
import { ParseError } from "./errors"

const sectionNames = [
	"Let's make a game!",
	"Settings",
	"Includes",
	"Layout",
	"Buttons",
	"Buildings",
	"Upgrades",
	"Items",
	"Achievements",
	"Resources",
	"Shinies",
	"CSS",
] as const

type SectionName = typeof sectionNames[number]

export interface SectionBase {
	name: SectionName
}

const objectSectionNames = ["Let's make a game!", "Settings"] as const
type ObjectSectionName = typeof objectSectionNames[number]

export interface ObjectSection extends SectionBase {
	name: ObjectSectionName
	value: ObjectDeclaration
}

export interface CSSSection extends SectionBase {
	name: "CSS"
	value: string
}

export type AST = {
	[P in ObjectSectionName]?: ObjectSection
} &
	{ [P in IdSectionName]?: IdSection } & {
		CSS?: CSSSection
		Layout?: LayoutSection
	}

export interface LangNode {
	name: string
}

export function genAst(tokens: Token[]): AST {
	const { eatToken } = tokenHelpers(tokens)
	const ast: AST = {}
	while (tokens.length !== 0) {
		const sectionName = eatToken()
		if (sectionName?.name !== "section" && sectionName?.name !== "cssSection")
			throw new ParseError("a valid section name", sectionName)
		switch (sectionName.match) {
			case "Let's make a game!":
			case "Settings":
				ast[sectionName.match] = {
					name: sectionName.match,
					value: parseLangObject(tokens),
				}
				break
			case "Buttons":
			case "Buildings":
			case "Upgrades":
			case "Items":
			case "Achievements":
			case "Resources":
			case "Shinies":
				ast[sectionName.match] = {
					name: sectionName.match,
					values: parseIdList(tokens, parseLangObject),
				}
				break
			case "Layout":
				{
					const idList = parseIdList(tokens, parseLangObject, ["use default"])
					ast.Layout = {
						name: "Layout",
						useDefault: idList.foundTags.includes("use default"),
						values: idList.value,
					}
				}
				break
			case "CSS": {
				const cssValue = eatToken()
				if (cssValue?.name !== "cssStyle")
					throw new ParseError("a CSS value", sectionName)
				ast.CSS = { name: "CSS", value: cssValue.match }
				break
			}
			case "Includes":
				throw new Error("You are using Includes what a neeeeeerd")
			default:
				throw new Error(
					"This must only happen if you tinkered with this code or with `tokens.ts`. Nice. Otherwise, report it pls."
				)
		}
	}
	return ast
}
