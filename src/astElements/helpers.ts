import { Token } from "../tokens"
/**
 * A simple factory to generate some token helpers
 * @param tokens The token list to generate the helpers from
 */
export default function tokenHelpers(tokens: Token[]) {
	let virtualPosition = 0
	/**
	 * Eats a token
	 * Virtual eat operations are considered done, so virtual position is reset
	 */
	function eatToken() {
		virtualPosition = 0
		return tokens.shift()
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
		for (let i = 0; i < virtualPosition; i++) eatenTokens.push(tokens.shift())
		return eatenTokens
	}
	return { virtualPosition, eatToken, virtualEat, virtualEatOld }
}
