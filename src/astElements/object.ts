import { LangNode } from "../astGen"
import { StringInstance } from "./string"
import { EffectStatement } from "./effect"

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

export interface ObjectInstance<T extends StringInstance | EffectStatement>
	extends LangNode {
	name: "ObjectInstance"
	key: ObjectKey
	value: T
}

export type StringObjectInstance = ObjectInstance<StringInstance>

export type EffectObjectInstance = ObjectInstance<EffectStatement>

export interface ObjectDeclaration extends LangNode {
	name: "ObjectDeclaration"
	value: (EffectObjectInstance | StringObjectInstance)[]
}
