/* eslint-disable no-debugger */
import { tokenize } from "./tokens"
import { parseLangObject } from "./astElements/object"
import { parseIdList } from "./astElements/idList"

const input = `*abc
poo: def
ab: cd
test
*mum
is: mega cute
mega sure: yup
abc`

const tokens = tokenize(input)

console.log(`Input:
${input}`)

console.log(parseIdList([...tokens], parseLangObject))

debugger
