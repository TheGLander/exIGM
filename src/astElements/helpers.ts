import { Token } from "../tokens"
/**
 * A simple factory to generate some token helpers
 * @param tokens The token list to generate the helpers from
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function tokenHelpers(tokens: Token[]) {
	let virtualPosition = 0
	/**
	 * Eats a token
	 * Virtual eat operations are considered done, so virtual position is reset
	 */
	function eatToken() {
		virtualCancel()
		return tokens.shift() ?? null
	}
	/**
	 * Returns a token without removing it
	 */
	function virtualEat() {
		if (virtualPosition >= tokens.length) return null
		else return tokens[virtualPosition++]
	}
	/**
	 * Eats all tokens before the current virtual token
	 */
	function virtualEatOld() {
		const eatenTokens: Token[] = []
		for (let i = 0; i < virtualPosition; i++) {
			const token = tokens.shift()
			// Trust me
			eatenTokens.push(token as Token)
		}
		virtualPosition = 0
		return eatenTokens
	}
	/**
	 * Resets the virtual pointer
	 */
	function virtualCancel() {
		virtualPosition = 0
	}
	/**
	 * Peeks a token at a specified position
	 */
	function peekToken(offset: number): Token | null {
		return tokens[offset + virtualPosition] ?? null
	}
	return {
		virtualPosition,
		eatToken,
		virtualEat,
		virtualEatOld,
		virtualCancel,
		peekToken,
	}
}
