import tokenize from "../tokens"
import { parseLangObject } from "./object"

it("should throw on invalid tokens", () => {
	expect(() => parseLangObject(tokenize(`*invalid`))).toThrowError(
		"Expected an object key at position 0, got '*invalid'"
	)
	expect(() => parseLangObject(tokenize(`not valid object:`))).toThrowError(
		"Expected an object value at the end, got 'undefined'"
	)
})
