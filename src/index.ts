/* eslint-disable no-debugger */
import { tokenize } from "./tokens"
import { parseIdList } from "./astElements/idList"

const input = `*hi|bye`

const tokens = tokenize(input)

console.log(`Input:
${input}`)

console.log(`Output:
${parseIdList(tokens, tokens => {
	return { name: "hi", bonusCrap: tokens }
})
	.value.map(val => val.key.value.join(" or "))
	.join("\n")}`)
