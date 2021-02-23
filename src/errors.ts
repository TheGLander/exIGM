import { Token } from "./tokens"
export class TokenError extends Error {
	constructor(public leftoverCode: string) {
		super(`Couldn't tokenize the code
Leftover code: ${leftoverCode}`)
	}
}

export class ParseError extends Error {
	constructor(public nodeType: string, failedToken: Token | null) {
		super(
			`Expected ${nodeType} at ${
				failedToken ? `position ${failedToken.position}` : "the end"
			}, got '${failedToken?.match}'`
		)
	}
}
