import { Token } from "./tokens"
export class TokenError extends Error {
	constructor(public leftoverCode: string) {
		super(`Couldn't tokenize the code
Leftover code: ${leftoverCode}`)
	}
}

export class ParseError extends Error {
	constructor(public nodeType: string, failedToken: Token) {
		super(`Couldn't parse ${nodeType} at position ${failedToken.position}`)
	}
}
