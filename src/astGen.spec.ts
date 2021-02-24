import { genAst } from "./astGen"
import tokenize from "./tokens"

const AST = (str: string) => genAst(tokenize(str))

it("should be able to correctly parse a simple game", () => {
	expect(
		AST(`Let's make a game!
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
goodbye world
CSS
#thing {
	color: blue;
}`)
	).toStrictEqual({
		"Let's make a game!": {
			name: "Let's make a game!",
			value: {
				name: "ObjectDeclaration",
				value: [
					{
						name: "ObjectInstance",
						key: { name: "ObjectKey", value: "abc" },
						value: { name: "StringInstance", value: "def" },
					},
					{
						name: "ObjectPropertyStatement",
						value: { name: "ObjectKey", value: "this is a tag" },
					},
					{
						name: "ObjectInstance",
						key: { name: "ObjectKey", value: "test1" },
						value: { name: "StringInstance", value: "test2" },
					},
				],
			},
		},
		Layout: {
			name: "Layout",
			useDefault: true,
			values: {
				name: "IdDeclaration",
				value: [
					{
						name: "IdInstance",
						key: { name: "IdIdentifier", value: ["hi"] },
						value: {
							name: "ObjectDeclaration",
							value: [
								{
									name: "ObjectInstance",
									key: { name: "ObjectKey", value: "bye" },
									value: { name: "StringInstance", value: "e" },
								},
							],
						},
					},
				],
			},
		},
		Resources: {
			name: "Resources",
			values: {
				name: "IdDeclaration",
				value: [
					{
						name: "IdInstance",
						key: { name: "IdIdentifier", value: ["test1", "test2"] },
						value: {
							name: "ObjectDeclaration",
							value: [
								{
									name: "ObjectInstance",
									key: { name: "ObjectKey", value: "hello" },
									value: { name: "StringInstance", value: "world" },
								},
								{
									name: "ObjectPropertyStatement",
									value: { name: "ObjectKey", value: "test" },
								},
							],
						},
					},
					{
						name: "IdInstance",
						key: { name: "IdIdentifier", value: ["test3"] },
						value: {
							name: "ObjectDeclaration",
							value: [
								{
									name: "ObjectInstance",
									key: { name: "ObjectKey", value: "on tick" },
									value: {
										name: "EffectStatement",
										effectAST: {
											name: "EffectCommand",
											commandName: "multiply",
											affectedProperty: "yield",
											amount: {
												name: "EffectExpression",
												value: { name: "EffectExpressionNumber", value: 777 },
											},
											of: {
												name: "EffectSelector",
												tags: ["test"],
												notTags: ["notTest"],
												categories: [],
												ownedState: null,
												selectorKey: undefined,
												all: true,
											},
											from: {
												name: "EffectSelector",
												tags: ["tier1"],
												notTags: ["pseudoTier2"],
												categories: ["buildings"],
												ownedState: null,
												selectorKey: undefined,
												all: false,
											},
										},
									},
								},
								{
									name: "ObjectInstance",
									key: { name: "ObjectKey", value: "on tick" },
									value: {
										name: "EffectStatement",
										effectAST: {
											name: "EffectCommand",
											commandName: "multiply",
											affectedProperty: "yield",
											from: undefined,
											amount: {
												name: "EffectExpression",
												value: {
													name: "EffectExpressionBinaryOperator",
													operation: "-",
													left: {
														name: "EffectExpressionBinaryOperator",
														operation: "*",
														left: { name: "EffectExpressionNumber", value: 10 },
														right: {
															name: "EffectExpressionNumber",
															value: 12,
														},
													},
													right: {
														name: "EffectExpressionBinaryOperator",
														operation: "^",
														left: { name: "EffectExpressionNumber", value: 5 },
														right: { name: "EffectExpressionNumber", value: 7 },
													},
												},
											},
											of: {
												name: "EffectSelector",
												tags: [],
												notTags: [],
												categories: [],
												ownedState: null,
												selectorKey: undefined,
												all: true,
											},
										},
									},
								},
								{
									name: "ObjectPropertyStatement",
									value: { name: "ObjectKey", value: "goodbye world" },
								},
							],
						},
					},
				],
			},
		},
		CSS: {
			name: "CSS",
			value: `#thing {
	color: blue;
}`,
		},
	})
})

it("should throw on invalid source code", () => {
	expect(() => AST(`*notheader`)).toThrowError(
		"Expected a valid section name at position 0, got '*notheader'"
	)
})

it("should throw on unimplemented headers", () => {
	expect(() => AST(`Includes`)).toThrowError(
		"You are using Includes what a neeeeeerd"
	)
})
