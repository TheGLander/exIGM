import tokenize from "../tokens"
import { parseIdList } from "./idList"

it("should throw on invalid tokens", () => {
	expect(() =>
		parseIdList(
			tokenize(`not valid id list
*bla bla bla`),
			() => ({ name: "PLACEHOLDER" })
		)
	).toThrowError("Expected an id list at position 0, got 'not valid id list'")
})
