interface TokenType {
	regex: RegExp
	name: string
	/**
	 * If set, requires the last token to have the name (I know this shouldn't really exist, but it leads to a lot of mess due to CSS)
	 * If prefixed with !, requires the last token to *not* be with the name
	 */
	last?: string
}

/**
 * The types of tokens the language accepts
 */
const tokenTypes: TokenType[] = [
	{
		regex: /Let's make a game!|Settings|Includes|Layout|Buttons|Buildings|Upgrades|Items|Achievements|Resources|Shinies/,
		name: "section",
		last: "!key",
	},
	// CSS section is special
	{ regex: /CSS/, name: "cssSection" },
	// Sorry for the mess, I blame CSS
	{
		regex: /(?:(?!Let's make a game!|Settings|Includes|Layout|Buttons|Buildings|Upgrades|Items|Achievements|Resources|Shinies|$).)+/s,
		name: "cssStyle",
		last: "cssSection",
	},
	// Key-value stuff
	{ regex: /[\w ]+:/, name: "key" },
	// Spritesheet value
	{
		regex: /\w+, \d+ by \d+, \w+\.jpg/,
		name: "spritesheetValue",
		last: "key",
	},
	// Generic string value
	{ regex: /.+(?<!\s)/, name: "value", last: "key" },
	{ regex: /\*(?!\|)[a-zA-Z|0-9]+(?<!\|)/, name: "thingKey" },
	{ regex: /\/\/|\/\*|\*\//, name: "comment" },
	// A general purpose tag, eg. no tooltip
	{ regex: /[\w ]+(?=\n)/, name: "tag" },
]

const expressionTokenTypes: TokenType[] = [
	// Tags
	{ regex: /<(b|i|u|t|q|(?:#[\da-f]{3}))><\/\1>/, name: "tag" },
	{ regex: /<(\/|\/\/|\.)>/, name: "openTag" },
	// Commands & stuff
	{ regex: /end/, name: "end" },
	{ regex: /if|else/, name: "flowStatement" },
	{ regex: /\$\w+/, name: "variableIdentifier" },
	// Leaving this monstrosity up to the AST, sorry
	{
		regex: /increase|lower|multiply|(yield of)|(cost of)|(refund of)|(frequency of)|(duration of)|spawn|yield|lose|grant|by|do|with|show|hide|light|dim|anim|(anim icon)|log|(log\(\w+\))|toast/,
		name: "command",
	},
	// Expressions
	{ regex: /\d+(\.\d+)?/, name: "number" },
	{ regex: /\(|\)/, name: "parenthese" },
	// Operations
	{ regex: /have|no/, name: "exprKeyword" },
	{ regex: /and|or|!/, name: "logicOperation" },
	{ regex: /\+|-|\*|\/|%/, name: "binaryOperation" },
	{ regex: /is|=|<|<=|>|>=/, name: "compareOperation" },
	{
		regex: /min|max|floor|ceil|round|roundr|random|frandom|chance/,
		name: "function",
	},
	{ regex: /\w+(:\w+)*/, name: "identifier" },
]

export function tokenizeExpression(code: string): Token[] {
	const tokens: Token[] = []
	/**
	 * Tries to find a matching token for the current code
	 */
	function generateToken(): Token | null {
		for (const type of expressionTokenTypes) {
			const res = type.regex.exec(code)
			if (res?.index !== 0) continue
			return { match: res[0], name: type.name }
		}
		return null
	}
	while (code !== "") {
		const token = generateToken()
		if (token === null)
			throw new Error(
				`Can't tokenize the expression!
Leftover code: ${code.trim()}`
			)
		tokens.push(token)
		code = code.substr(token.match.length).trim()
	}
	return tokens
}

/**
 * A generic token
 */
export interface Token {
	match: string
	name: string
}

/**
 * Splits code into tokens
 * @param code The code to split into tokens
 */
export default function tokenize(code: string): Token[] {
	const tokens: Token[] = []
	/**
	 * Tries to find a matching token for the current code
	 */
	function generateToken(): Token | null {
		for (const type of tokenTypes) {
			// Require last token if needed
			if (
				type.last &&
				(/^!/.test(type.last)
					? type.last.substr(1) === tokens[tokens.length - 1]?.name
					: type.last !== tokens[tokens.length - 1]?.name)
			)
				continue
			const res = type.regex.exec(code)
			if (res?.index !== 0) continue
			return { match: res[0], name: type.name }
		}
		return null
	}
	while (code !== "") {
		const token = generateToken()
		if (token === null)
			throw new Error(
				`Can't tokenize the code!
Leftover code: ${code.trim()}`
			)
		tokens.push(token)
		code = code.substr(token.match.length).trim()
	}
	return tokens
}

console.log(
	tokenize(`Let's make a game!
	on click:if (true = true) 
	yield 5 abc1
	else if (true = false)
	yield 5 abc2
	end
	`)
		.map(val => JSON.stringify(val))
		.join("\n")
)
