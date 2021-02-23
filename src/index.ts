/* eslint-disable no-debugger */
import { tokenize, tokenizeExpression } from "./tokens"
import { genAst } from "./astGen"
import { parseEffectExpression } from "./effectAstElements/expression"

const input = `Let's make a game!
abc: def
this is a tag
test1: test2
Layout
use default
*hi
bye: e
Resources
*test1|test2
hello: world
test
*test3
on tick: multiply yield of :All:tag:test:notTag:notTest from test:tag:tier1:notTag:pseudoTier2:Buildings by 777
on tick: multiply yield of :All by 10*12-5^7
goodbye world`

console.debug(`Input:
${input}`)

const tokens = tokenize(input)

console.debug("Tokens:")
console.debug(tokens)

const AST = genAst(tokens)

console.debug("AST:")
console.debug(AST)

debugger
