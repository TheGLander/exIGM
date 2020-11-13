import { IdSection, IdSectionName } from "./astElements/idList"
type SectionName =
	| "Let's make a game!"
	| "Settings"
	| "Includes"
	| "Layout"
	| "Buttons"
	| "Buildings"
	| "Upgrades"
	| "Items"
	| "Achievements"
	| "Resources"
	| "Shinies"
	| "CSS"

export interface SectionBase {
	name: SectionName
}

type KeyValSectionName = "Let's make a game!" | "Settings"

export interface KeyValSection extends SectionBase {
	name: KeyValSectionName
	values: Record<string, VisibilityState>
}

export interface CSSSection extends SectionBase {
	name: "CSS"
	value: string
}

export type AST = Record<IdSectionName, IdSection | undefined> & {
	CSS: CSSSection
} & Record<KeyValSectionName, KeyValSection>

export interface LangNode {
	name: string
}

//export function genAst(tokens: Token) {}
