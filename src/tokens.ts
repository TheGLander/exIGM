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
	{ regex: /[\w ]+\b/, name: "tag" },
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
				`Can't tokenize the expresison!
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
	name:Idle Game Maker Fan Guide
	by:Agentperson
	desc:Learn about concepts of IGM. Made by IGM developers.</></><t><#404040>Credits</#><//></><b>Orteil</b> made Idle Game Maker and owns the engine. Shoutouts to him.<//></><b>Agentperson</b> -<.>Basically worked on everything in the game's code and interface.<.>Worked on the all of the Intro Guides, Advanced Guides, and others.<//></>All Games mentioned here are owned by their respective owners.
	created:14/12/2019
	updated:21/09/2019
	version:1
Settings
	stylesheet:https://pastebin.com/kEcpmpRN
	no particles
	no bulk particles
Layout
    *main
        contains:Log
		class:top
	*store
		contains:upgrades
	*upgrades
		contains:beginguide, advancedguide, misc, games, gamesReddit, GameInfo
	*beginguide
		contains:tag:Beginner
		header:Intro Guides
		costs:hide
	*advancedguide
		contains:tag:Advanced
		header:Basic Things
		costs:hide
	*misc
		contains:tag:Misc
		header:Advanced Techniques
		costs:hide
	*games
		contains:tag:Games
		header:Games (From Dashnet Discord)
		costs:hide
	*gamesReddit
		contains:tag:GamesReddit
		header:Games (From r/idlegamemaker)
		costs:hide
	*GameInfo
		contains:tag:GameInformation
		header:Game Information
		costs:hide
CSS
.thing
{
	border-radius:8px;
    background:rgba(255,255,255,0.5);
}

Resources
	*Tick
        on tick:if (0>=Tick) yield 1 Tick
        on tick:if (Tick=0) log <t><#404040>Welcome to The (Better) Idle Game Maker Guide</#></>To Read a Guide, Click on the Side to the desired guide.<//></>Please read the actual handbook before continuing. This is meant to cover things from the handbook more up-to-date and fixes some errors (Stuff Like it being by: and not author:).<//>Last Updated: September 21st, 2020<//></>
        on load:lose 1 Tick
        always hidden
Upgrades
//Beginner Guides
	*TEMPLATE
		start with
		no buy
		on click:clear log
		tag:Beginner
	*IGMCIntro
		name:[Easy] IGM Concepts - Intro (By Agentperson)
		on click:clear log
		on click:log <//></><t><#404040>IGM Concepts - Introduction</>By Agentperson</#><//>Welcome to Idle Game Maker! If you are reading this, you probably already read the handbook, but if you haven't, go do that so you would have a better idea of what is expected here. While this guide series will cover everything starting from the "Source File" Section section, still recommend reading the handbook up to Let's make a game! as it cover stuff not mentioned here..<//></><t><#404040>Writing your Source File</#><//>In case you haven't read the first section of the handbook (Which you most likely did), games can be played at <b>http://orteil.dashnet.org/igm/?g=</b> . This means  if your game file is hosted at <b>https://www.example.com/Game.txt</b>, the link to play will be <b>http://orteil.dashnet.org/igm/?g=www.example.com/Game.txt</b> . If you are using pastebin, then the game link can be shortened to just the letters at the end of the url (A game hosted at www.pastebin.com/gUk4VbP6 would be http://orteil.dashnet.org/igm/?g=gUk4VbP6 to play).</></>Here's some general tips.<.>Leading Tabs and spaces are ignored.<.>You can mark a line with "//" to make it not be read by the engine. You can mark multiple lines with "/*" and "*/" (/* must be at the start, while */ must be a the end.)<.>You should check your spelling.<.>Privated links that require a login or something will not run for obivous reasons.<.>(Pastebin) Password Locked Pastes will not allow your game to run.<//></><t><#404040>Starting With The Basics</#><//>You're starting fresh with a new game. This is the first line.<//></>Let's make a game!<//></>This is the most important thing you need for your game. If this is not here or not in the first line, the engine will not work. It needs to know that we are making a game.<//></>Now that we got that out of the way, now we are going to start defining the details that will show in the info section (The I in the corner).<//></>name:123</>This is the name of your game.<//></>by:123</>This is where a name goes.<//></>desc:123</>A place where you can put info about the game. This accepts Text Effects, which will be covered later.<//></>created:DD/MM/YEAR</>The day you created your game.<//></>updated:DD/MM/YEAR</>The day you last updated your game. Doesn't have to be up to date.<//></>version:1.2.3</>The version of your game. Keep this up to date if you are using this.<//></><t><#404040>Setting Up The Game</#><//></>Settings</>You need this to start the Settings section. Settings is a place where you can set things up for your game, like a background. You will need this section to set these options (Unless you use CSS and Templates).<//></>background:url.jpg<//>Sets a background. It needs to be stored online for it to work.<//></>tiling background:url.jpg</>Sets a background that will be tiled.<//></>building cost increase:123%</>Defines how much a building costs after each purchase. 100% means no increase and 200% means it doubles the price after a purchase. (Default is 115%)<//></>building cost refund:12%</>Defines how much a building is sold for. 50% means half of the current price. (Default is 50%)<//></>spritesheet:Name, 48 by 48, url.jpg</>Makes a new Spritesheet named "Name" with each tile being 48 pixels horizontally and 48 pixels vertically, with it being stored at url.jpg (48 can be changed with whatever size you want, but 48x48 is the default size for icons. Buttons are 256x256). Basically it's a large image with images inside it.</> An example would be that you want to set a icon with a item. Using icon:Name(1,2) ("()" will not work. Refer to the Handbook for the actual piece. This is due to engine behavior.) will allow you to use the icon located 1 tiles horizontally and 2 tiles vertically. It starts at (0,0).</>You can have multiple spritsheets as long as they have different names.<//></>stylesheet:url</>Another text file that adds CSS to your game. Not setting one will default to basic theme. You can also use predefined themes (stylesheet:stuff/bigBlue.css) or use the CSS section to put CSS there.<//></>no particles</>Prevents particles from appearing when doing things.<//></>no bulk particles</>Prevents particles from appearing when bulk buying. This does not disappear with the above command.<//></><t><#404040>What About Images?</#><//>I have made this section to tell you about images for some reason. You can add images by using this command<//></>icon:url.jpeg<//></>You can also command mention above if you're using a spritesheet.<//></>In order for images to work, you need to store them online on a image hosting site. You can use any at your choosing, but <b>don't use Imgur. It's against it's terms of service for uses like Idle Game Maker and could cause trouble. ALWAYS read the fine print.</b> If you need help finding a image hosting site or places to even make images, go to the Recommended Sources thing located at the Game Information Section. Now that we got that out of way, I can finish this.<//></><t><#404040>Conclusion</#><//>This finishes the Intro section of IGM. However, this is only the beginning. The next guide in this series will be Layouts.<//></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	*IGMCLayouts
		name:[Easy] IGM Concepts - Layouts (By Agentperson)
		on click:log <//></><t><#404040>IGM Concepts - Layouts</>By Agentperson</#><//>Your Game's layout is the most import things to use in your game. It makes it easy to navigate things. Example of a layout would be this game. While this guide will be covering this, you can also just do this.<//></>Layout</>use default<//></>The above will produce what's needed for most games. You can also just skip this section (Not Tested by AgentPerson).<//></><t><#404040>Layout Commands</#><//>A Game's layout is made of Boxes. Each box could contain Resources, Buttons, Buildings, Upgrades, Achievements, Tags, other Boxes, and logs (All of which will be covered later). Each along side CSS can be used to make a very complex game layout. Before you start making a layout, you need to know the what command does what. Here's a brief explanation of each command.<//></>*BoxKey</>A Box is what makes a layout.</></>contains:X</>This what goes into the box. I already gave examples from the beginning of this section.<//></>header:123 and footer:456<//>It's text shown at the top/bottom of the box. Good for labeling stuff.<//></>class:cssClass<//>Gives a box CSS effects. This will be covered eventually.<//></>tooltip origin:originName<//>When the player highlights their mouse over a thing in this box, a tooltip will appear. This will change what direction it's facing (up,down,left,right).<//></>tooltip class:cssClass<//>Gives the tooltips CSS effects. Once again this will be covered later.<//></>no tooltip<//>Tooltips will not appear.<//></>names:show and names:hide<//>names:show will show the Things' names. names:hide will not.<//></>icons:show and icons:hide<//>icons:show will shows the Things' icons. icons:hide will not........ if you ever need it.<//></>costs:show and costs:hide<//>costs:show will show the Things' cost. costs:hide will not.<//></>ps:show and ps:hide<//>You already know what these do. PS stands for Production per Second<//></><t><#404040>Your Layout</#><//>This game uses a layout that makes what you're seeing right now. This is the code.<//></>Layout</>*main</>contains:log</>*store</>contains:upgrades</>*upgrades</>contains:beginguide, advancedguide, misc, games</>*beginguide</>contains:tag:Beginner</>header:Beginner Guides</>costs:hide<//></>Note that there is more than what's shown, but the rest is basically the same as *beginguide<//></>Main is what's containing log. The log is what you are reading right now.<//></>Store seems useless, but since I'm too lazy to edit the CSS of the game, it basically still has a purpose.<//></>The upgrades is a section where the guides are place that you click to read them. It is divided by 4 sections as shown.<//></>The remaining 4 boxes (excluding the log box) are all similar to each other with some edits. These are where the "Upgrades" are place.<//></>A more common example would be this.<//></>Layout</>*main</>contains:res, buttons</>*res</>contains:Resources</>class:fullWidth</>*buttons</>contains:Buttons</>*store</>contains:buildings, upgrades</>*buildings</>contains:Bulkdisplay, Buildings</>header:Buildings</>tooltip origin:left</>*upgrades</>contains:Upgrades</>header:Upgrades</>costs:hide</>names:hide<//></>Please do not sort your code like this, as it makes it unorganized and harder to read.<//></>Main this time contains res (Resources) and buttons. The res box contains Resources, which are things that you can earn and spend (Likes Cookies in Cookie Clicker). Buttons are the thing you click to earn more resources.<//></>Store this time has a obvious purpose, being the box that contains buildings and upgrades. The buildings box contains Buildings, which are things that produce certain resources per tick. BulkDisplay is used to show the Buying 1 and Selling 50 bulk buying stuff. The upgrades box contains Upgrades, which boost things like buttons and Buildings. Using creativity with this can make some cool things too.<//></>Some games add a achievements section in their games. This shows the achievements the player has.<//></><t><#404040>Layouts and CSS</#><//>Making a layout is easy, but you are going to need CSS. CSS stands for Cascading Style Sheets. CSS goes into Settings as "stylesheet:url" and the CSS section. This could be used to make your game look like something and make some boxes appear. You can read about CSS here (https://www.w3schools.com/css/) or you can look at other's stylesheets and copy and paste <b>SOME</b> of their stuff (That's what I do at least). Some people think of ways to make their games unique from the others, like Mine's log, where it displays a message at random when click the pickaxe.<//></><t><#404040>Conclusion</#><//>This finishes the layout section of IGM. However, there is a lot more to cover on IGM. The next guide in this series will be Things. I don't know how to end this so goodbye.<//></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	*IGMCThings
		name:[Easy] IGM Concepts - Things (By Agentperson)
		on click:log <//></><t><#404040>IGM Concepts - Things</>By Agentperson</#><//>When you make a Idle Game Maker game, what's important is to have things in your game to have a "game". Without them you are basically recreating the web page about:blank. Let's just start.<//></><t><#404040>Background Knowledge</#><//>Every intractable item in your game is a thing aside from a few things. Each thing has it's own id (or Key) that's used to Identify it. A thing can have multiple keys using "|". An example of this will be shown later. Some other things to note are...<.>The section where the thing is created defines it's type. A thing made in the building section will be a building and so on.<.>Two things cannot have the same key.<.>Once a Key is set, it's recommended not to change it as changing it will mess with saves.<.>Only Letters and Numbers can be used. This means "¯\\_(ツ)_/¯" cannot be used as a id.<.>Anything with "Yellow" cannot be a key either or anything with the capital Y. I had tried.<.>20 Characters is the max size for a key. Don't believe me? Make a key called *AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA and you will get an error.<//></><t><#404040>Thing Commands</#><//>To make a thing you use this.<//></>*ThingId<//></>This must be the first line of your thing.<//></> Now for the rest.<//></>name:123</>Defines a name for the thing. Unlike keys this accepts anything the isn't a letter or number. This means "¯\\_(ツ)_/¯" and "Yellow" will work here. You define a plural name using "|". Once again an example will be shown later.<//></>desc:123</>A description that will show on tooltips. It's usually used to describe what the item does. Accepts text effects which will be covered later.<//></>text:123</>If used, this will display instead of the name. This accepts text effects which would add more color or something to the text. Pancake Maker has a great example of this in action. Please note that the item's tooltip will not show the text.<//></>icon:url.png|icon:Name(1,2)</>This will display an image. We already covered icon:Name(1,2) in the intro guide. icon:url.png will display whatever image that url goes to. .jpg and .gif will also work among others. The default size of an icon is 48x48 while a button is 256x256.<//></>tag:123|tags:123 456</>Gives your thing a tag. You can define multiple tags using tags: and adding spaces. Tags follow the same name restrictions as keys so "🍕" will not work. These can come in handy in multiple situations as tags will work similarly to ids. Basically, when you use "contains:tag:DeleteSystem32" it will place all the things with the tag "DeleteSystem32". Don't ask why I used DeleteSystem32 as an example tag.<//></>costs:1 Cookie</>If it's a building or upgrade, it defines it's cost. You can use both resources and buildings. Buildings can scale it's cost with it's own amount (Buy 50 is pretty buggy though).<//></>req:1 DeliciousEdibleFood</>Defines the things the player need to unlock the thing. It will not appear until the requirements are met. For achievements, it will be earned when it's requirements are met. For buttons and shinies, it will break your game for some reason I can't explain. They can be simple or use expressions (Will be covered. I promise.). You can also stack them using the command again, but you can simply use commas unless you're making really complex code.<//></>hidden</>The thing is hidden.<//></>no text</><q>I have been silenced...</q></>Hides all text. If you're using a icon for that thing, it will still show.<//></>class:cssClass</>Adds Css Classes to the thing. You can use multiple by using spaces. The most common use for this is in buttons with the "class:bigButton hasFlares".<//></>icon class:cssClass</>Adds Css Classes to the thing's icon.<//></>tooltip origin:originName</>The item's tooltip will show in the following directions.</>top</>bottom</>left</>right<//></>tooltip class:cssClass</>Gives a Css class to the item's tooltip.<//></>no tooltip</>The tooltip does not show.<//></>start with:X</>For resources and buildings, gives X amount when the game starts.<//></>owned|start with</>For upgrades and achievements, the player will own them at the start.<//></>shown</>Shows the thing when game starts<//></>hidden</>Hides the thing when game starts<//></>lit</>Makes the thing light up.<//></>dim</>The thing does not light up.<//></>hidden when 0</>Hides the thing when none of it is owned.<//></>always hidden</>The thing must never be shown.<//></><t><#404040>Example Time!</#><//>*Cookie|Cookies</>name:Cookie|Cookies</>text:You own (Cookies) Cookies</>icon:CookieImgUrl.png</>tag:CookieTag</>hidden when 0</>tooltip origin:bottom<//></>Since there are two keys defined, the engine will refer both keys to one item.<//></>Since there's a plural name, it will show it's plural name when appropriate.</>The thing will display the text "You own (Cookies) Cookies" instead of the name. (Cookies) will not work in the actual engine to show the number of cookies.<//></>The rest show already been explained enough in the above section.<//></><t><#404040>Templates</#><//>Templates are things that, when used, all of the items below it will copy it's commands. Really useful when you are making a game where there's a lot of identical items (Like Pancake Maker). There are also Includes, but those will be covered later. An example template would be something like this.<//></>*TEMPLATE</>desc:Yields 3 Cookies each second.</>on tick:yield 3 Cookies<//></>All of the items below it will have the same description unless redefined in the item. Some effects will stack on each like on tick. An example of this would look something like this.<//></>*Oven</>name:Oven<//></>*Grandma</>name:Grandma</>desc:Yields 5 cookies each second.</>on tick:yield 2 Cookies<//></>*Cursor</>name:Cursor<//></>The things Oven and Cursor are identical, but Grandma has it's own description and the on tick effects stack. Once you start a new section or Template, the previous template will clear.<//></><t><#404040>Conclusion</#><//>At this point, you might be able to make a game. Maybe it's not functional, but it's getting close to being somewhat functional. The next guide will cover both Buttons and Resources.</></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	*IGMCButtonsResources
		name:[Easy] IGM Concepts - Buttons and Resources (By Agentperson)
		on click:log <//></><t><#404040>IGM Concepts - Buttons and Resources</>By Agentperson</#><//>If you have played any of the IGM games in the game section or even others around the internet, you would know that all, if not almost all have buttons and resources. They are needed to create the actual Gameplay of the game. If there's no gameplay, there's no game, but that's already obvious so I'm gonna stop the intro.</></><t><#404040>Making Buttons!</#><//>They really have no purpose as all things can act as a button with the "on click:" command, unless you either want to track it's clicks without making extra code or keep your game organized. If you are starting to use the engine, I'd recommend going with this. Anyway, here's the one command that works specifically for buildings.</></>show clicks</>On the button's tooltip, it will show how many times it has been clicked.</></>Now for an example.</></>*MakeCookie</>name:Make Cookies</>desc:Bakes 1 Sweat Cookie.</>on click:yield 1 Cookie</>show clicks</></>Now that we got that done, we now need to add a resource named "Cookie". If we don't do this, then the engine will return with an error, but to most that's already obvious and will soon be for you too with enough practice.</></><t><#404040>Making Resources</#><//>Resources are numbers that keep count of things. Mainly used to make currency in IGM games. Here's some commands that are for this thing.</></>can be negative</>With this, the resource's amount can go below 0.</></>is always:X</>The resource's value is always equal to X. Can be used with expressions.</></>show earned</>Shows the resource's earned amount.</></>show max</>Show the resource's max amount ever reached.</></>For the example, we'll go back to thing we made from the Things guide. The Cookies.</></>*Cookie|Cookies</>name:Cookie|Cookies</>text:You own (Cookies) Cookies</>icon:CookieImgUrl.png</>tag:CookieTag</>hidden when 0</>tooltip origin:bottom</><b>show earned</>show max</b></></>Now that there's a resource for the button, you can now click to button to receive a cookie.</></><t><#404040>Increasing Numbers By Other Means (Can Skip)</#><//>As you saw in the previous section, resources can be increased by buttons. However, they can also be increased by everything else. The following example will show a thing the increases itself when activated, and the player needs to time a click to get money. This is from the game Pancake Maker (Shameless plug, I know). Once the player unlocks the Orange Juice recipe, a new button will show up in the drinks section. If they click it, the OJMeter Thing will start. The player needs to do then is click the thing when it's the closest to 50. The closer they are, the more cash they get when they sell the drink. Now for the code.</></>*OJMeter</>on tick:if (OJMeter>=1) yield (random(5,10)) OJMeter</>on tick:if (OJMeter>100) lose (OJMeter-100) OJMeter</>tag:OrangeJuiceM</>on click:if (10>=OJMeter) yield 1 OJBad</>on click:if (OJMeter>=11) yield 1 OJOk</>on click:if (OJMeter>=26) yield 1 OJGood</>on click:if (OJMeter>=26) lose 1 OJOk</>on click:if (OJMeter>=46) yield 1 OJPerfect</>on click:if (OJMeter>=46) lose 1 OJGood</>on click:if (OJMeter=50) yield PerfectDrink1</>on click:if (OJMeter>=56) yield 1 OJGood</>on click:if (OJMeter>=56) lose 1 OJPerfect</>on click:if (OJMeter>=76) yield 1 OJOK</>on click:if (OJMeter>=76) lose 1 OJGood</>on click:if (OJMeter>89) yield 1 OJBad</>on click:if (OJMeter>89) lose 1 OJOK</>on click:lose (OJMeter) OJMeter</>on click:yield 1 SellDrinks</>on click:hide tag:OrangeJuiceM</>on click:show tag:DrinkResults</></>OJ was used to shorten the key names' length. If this item is at 0, the statement "on tick:if (OJMeter>=1) yield (random(5,10)) OJMeter" is not true and will not activate. If this statement is true, then it will increase it's own value by 5, 6, 7, 8, 9, or 10. Once it is clicked, the player will receive one of 4 types of orange juice. Bad being the worst, while Prefect being the best. Once this is clicked, the value goes back to 0. The player can then sell their drink.</></><t><#404040>Conclusion</#><//>Now you have a functioning clicking game.</>👏 Good job for making it this far. 👏</>However, you still have more to learn to make a functioning <b>idle</b> game. The next guide will cover Buildings and Upgrades.</></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	*IGMCBuildings
		name:[Easy] IGM Concepts - Buildings and Effects (By Agentperson)
		on click:log <//></><t><#404040>IGM Concepts - Buildings and Effects</>By Agentperson</#><//>This company has 4 Factories. Each Factory produces X amount of Cookies per minute. Meaning all 4 factories would produce X*4 Cookies per minute. That might be unrealistic depending on what X is, but this isn't real life anymore...</></><t><#404040>About Buildings</#><//>Buildings are things that can be bought and sold (Buy 50 is still buggy though), which increases or decreases their amount. Their effects are scaled as well. One needs to be own in order for the effects to kick in.</></>Clicking on it will purchase one building. Keyboard shortcuts can be used to Buy 50, Sell 1, and Sell 50 (Shift / Ctrl / Shift+Ctrl respectively) however, the costs do not scale properly. There are fixes to this bug though which you can do yourself which will be explained later.</></><t><#404040>Building Buildings (I just wanted to use this title)</#><//>Now for commands.</></>cost increase:123%</>Defines how much the building's cost increases after a purchase. 100% means no increase, and 200% means the price is doubled. Default is 115%.</>Unlike it's Settings Counterpart, <b>it only affects the building it is placed in.</b></></>cost refund:12%</>Defines how much the building can be sold for based off the current price. 50% means half of the price. Default is 50%.</>Unlike it's Settings Counterpart, <b>it only affects the building it is placed in.</b></></>no buy</>Cannot be purchased. You can use it if you like to handle the amount by other means.</></>show max</>In the building's tooltip, it will show the max ever received.</></>In the Things guide, we made a Cursor building. While it was in a template, for the sake of examples, we'll make it it's own item.</></>*Cursor</>name:Cursor</>desc:Yields 3 Cookies each second.</>on tick:yield 3 Cookies</></>Basically, that's a building. However, I would like to explain this line.</></>on tick:yield 3 Cookies</></>This is an effect, and we'll explain it more detail after this skippable section.</></><t><#404040>Patching Buy 50 Part 1 (Can Skip)</#><//>If you have ever been into development before, you would about debugging. If you don't, then look it up. If you do, that's basically what we are doing. See, there's a command call "limit" which limits the amount of items the player can hold for a thing. There's also a math equation that you can use. I'll give you some time to think of where I'm going with this. Go ahead. I'll reveal the answer for both methods to this in a bit.</></><t><#404040>Introduction To Effects</#><//>Effects is a feature that lets you do about anything the engine can do. They can yield items, change prices, boost building effects, and other things. They can be one line (The the previous examples) or they can be multi-lined ones called Effect Blocks, which need to have <b>end</b> in order to end the effects.</></>The following are built in effects with an explanation if needed.</></>on start: //Activates if the player starts for the first time or wipes a previous save.</>on save:</>on load:</>on tick: //Fires every second</>on click:</>passive: //Grants boosts to the player. Mainly used for upgrades, which will be covered next. They are handled the same way as on tick, but only separated to help with clarity.</>on earn:</>on lose:</></><t><#404040>Custom Effects</#><//>Custom Effects are effects that are custom made and can be called with effects (More specifically, the effects called "do effect" and "do effect with thingSelector"). So if you make an effect...</></>on sell:</>lose 12 Cookies</>yield 6 Money</>end</></>...it can be triggered with this.</></>on click:</>do sell</>end</></> Effects follow the same naming rules as Keys and Tags (Only Letters and Numbers).</></><t><#404040>Condition Flows</#><//>Conditions are expressions that follow if/else logic to determine if the effects within it are applied or not. Just like effects, they can be one line or be multi-lined ones, this time called Multi-line Condition Blocks. These should also finish with "end". Here's an instance where if the player has the ExtraCookies upgrade, they gain 2 through 12 cookies. If the player also owns the DoubleCookies Upgrades which is unlocked later, they get times two cookies.</></>on click:</>if (ExtraCookies>=1 and DoubleCookies>=1)</>yield (random(2,12)*2) Cookies</>else if (ExtraCookies>=1)</>yield random(2,12) Cookies</>else</>yield 1 Cookie</>end</></><t><#404040>Patching Buy 50 Part 2 (Can Skip if you had Skipped the Previous Part)</#><//>Now that you're back with an answer, you can see if you did it correctly.</></>The first method, is with the limit command. The answer to this is limit:(buildingName+1) . While this has some flaws, it's the most you could do to prevent easy cheating.</></>The other method is a little more involved once you put it in your game, but you most likely don't know how to yet as we haven't covered it yet. The answer to this is (BuildingCost)*(Cost Multiplier)^(Building Amount). If you got this correct, you are decent at math (or you just look it up, there's not way to tell). You will know where to put this after the following guides.</></><t><#404040>Local Variables</#><//>A Local Variable is a value that can be changed, set, and use in effect blocks. Once an Effect Block ends, the variables reset. Variables start with $ and must only contain Letters and Numbers. They are usually used to do complex operations. Now for an example.</></>$CookieV=1</>if (have ExtraCookies) $CookieV=$CookieV+random(1,11)</>if (have DoubleCookies) $CookieV=$CookieV*2</>yield $CookieV Cookies</></><t><#404040>Selectors</#><//>Some effects can target specific things through Selectors. Here is some.</></>thingKey //Target the thing with that key</>this //Targets the thing the effect is in</>thingKey:owned //Targets the thing if it's owned</>thingKey:notOwned //Targets the thing if it's not owned</>tag:Tag //Targets anything with the tag "Tag"</>notTag:Tag //Targets anything without the the tag "Tag"</>:All //Targets everything</>:Resources / :Buttons / :Buildings / :Upgrades / :Achievements / :Items / :Shinies // Targets anything within the type called.</>You can mix and max Selectors. / :Upgrades:tag:cookie:owned / will target any Upgrade owned with the "cookie" tag.</></><t><#404040>Conclusion</#><//>Now you what building and effects are, but now we need to explain each effect, which will be the next guide. Bye.</></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	*IGMCEffects2
		name:[Easy] IGM Concepts - Every Known Effect (By Agentperson)
		on click:log <//></><t><#404040>IGM Concepts - Every Known Effect</>By Agentperson</#><//>if Cookie>=1</>Cookie=Cookie+1</></><t><#404040>Effects!</#><//>Oven is X|Oven=X</>If the object is a resource or building, it will set it's amount to X. X can be a number, "this", another building/resource, a local variable, or an expression (Which will be covered later).</></>$LocalVar is X|$Localvar=X</>Sets the LocalVar's value to X.</></>yield x Cookies</>If the thing is a resource/building, it's value will go up by X. Otherwise, you'll earn it. <b>"yield", "gain", "win", and "get" all work similarly.</b></></>yield Cookie</>Works similarly to "yield X Thing", but the result will always be 1.</></>lose X Cookies</>If the thing is a resource/building, the value will go down by X. Otherwise, you'll lose it.</></>lose Cookie</>Works similarly to "lose X Cookies", but the result will always be 1.</></>grant X ShinyCookies</>If the thing is a building or resource, it will add a pemanent amount to it. May produce unwanted results if you are also using yield and lose on it.</></>increase yield of Grandma by X.</>The thing's yield will increase by X. <b>"increase gain" also works.</b></></>increase Cookie yield of Oven by X</>Similar to "increase yield of thing by X" but will only apply to Cookies (the mentioned Resource/Building).</></>lower yield of Grandma by X</>The thing's yield will be lowered by X.</></>lower Cookie yield of Oven by X</>Similar to "lower yield of thing by X" but will only apply to Cookies (the mentioned Resource/Building).</></>multiply yield of Oven by X</>The thing's yield will be multiplied by X.</></>multiply Cookie yield of Grandma by X</>Similar to "multiply yield of thing by X" but will only apply to Cookies (the mentioned Resource/Building).</></>increase cost of Oven by X</>The thing's cost with increase by X. <b>"lower cost of thing by X" and "multiply cost of thing by X" also work and do their repective actions.</b></></>multiply refund of Cursor by X</>The thing's refund rate is multiplied by X. So if the items refund rate is 50%, "multiply refund of Cursor by 0.5" will halve it's refund rate making it 75%.</></>spawn thingKey</>If a shiny, it will spawn.</></>multiply frequency of thingKey by X</>If a shiny, it's frequency will be multiplied by X. "multiply frequency of thingKey by 0.5" will make the shiny spawn twice as often.</></>multiply duration of thingKey by X</>If a shiny, it's duration will be multiplied by X. "multiply duration of thingKey by 1.5" will make the shiny last 50% longer.</></>do LookAtLonelyPeople|do LookAtLonelyPeople with thing</>Triggers a custom effect name "LookAtLonelyPeople" with thing. <b>Nested effects will stopped being applied after the 10th effect. Local Variables do not reset when in a trigger effect.</b></></>show thing</>Shows a thing.</></>hide thing</>Hides a thing.</></>light thing</>Lights up a thing.</></>dim thing</>Thing will be unlit.</></>anim cssClass</>Triggers a animation specified by the cssClass. Having animation makes your game more alive.</></>anim icon cssClass</>Similar to "anim cssClass", but applies to the icon specifically.</></>log This is logged.</>If your layout inculdes a "log" box, then it'll put a new message with the text "This is logged". You can also use "log(cssClass) Message" to give a cssClass.</></>clear log</>Removes all messages from the log.</></>toast This is a message.</>Makes a pop up box with the inputted text.</></><t><#404040>Conclusion</#><//>Well that took a while to make. The next guide will be on Upgrades.</></>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^Guide Starts At Top^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//Concepts
	*TEMPLATE
		start with
		no buy
		on click:clear log
		tag:Advanced
//Advanced Concepts
	*TEMPLATE
		start with
		no buy
		on click:clear log
		tag:Misc
	*SubmitGuide
		name:Submit A Guide (By Agentperson)
		on click:log <t><#404040>Submitting a Guide</>By Agentperson</#><//>Want to submit an guide here? You can do that by following this guide (to make a guide). As long as you have good English and good IGM knowledge, you can create a guide.</></><t><#404040>Rules And Requirements</#><//>Before we start making a guide, you need to know what classifies as a guide worthy of this guide. Here are things you should keep in mind.<.>Rules for the IGM engine apply (Visit the Official IGM handbook for more info).<.>The content must not exist already in other guides.<.>When talking about the player, do it in 3rd person (They, Them). Using "you" to describe the player makes it seem less professional.<.>Keep it easy to understand for a 13+ audience.<.>Follow the format other guides follow. There may be exceptions.</></>That's really it for rules.</></><t><#404040>A Good Example of A Guide</#><//>To keep things short, this client will make a guide to how to start using CSS. He decided to name it "Starting With CSS (By Name)". He decides to explain CSS in sections. Before we continue, this is how the Intro guides and this guide is set up, which you should do too to keep it organize.</></>He decided that the sections will be "Why use CSS?", "Layouts and CSS", "Effects and CSS", and "Examples". These will vary by guide and author. It's best make drafts before you make a final to submit for review so you can avoid easy to notice errors such as "Tehy will appercicaite a a more organized layoit." and mixing There, Their, and They're.</></><t><#404040>Conclusion And Contact</#><//>That's really it. If you need more info, contact me through the Dashnet discord server (https://discord.com/invite/cookie) (You need to be 13+ or the minimum age of digital consent in your country to use Discord. This is a requirement forced heavily in it's ToS.) in the #idle-game-maker channel and ping @Agentperson or (If you have Pastebin Pro) contact me from there.
	*TEMPLATE
		start with
		no buy
		no tooltip
		tag:Games
		on click:clear log
	*GameHelp
		name:[Read Me] Game Help (List Last Updated 10/4/2020)
		on click:log <t><#404040>Game Help</>By Agent_person</#><//></>Below this is list of games that have been pinned once on the DashNet discord, in the #idle-game-maker channel. Some games have been removed since. This list contains all games that have been pinned once, exculding any that have copyrighted material, or games made in the old engine.<t><#404040>How to report issues.</#><//></>Unless it has the discontinued label, you can report game issues to the original poster (Type "in:idle-game-maker AuthorName" into Discord search, then @ the user). Before you report an issue...<.>Check the box to see if it has a discontinued label. If it does, don't bother.<.>If the og poster is no longer in the server, but their game does not have the discontinued label, contact me ASAP.<.>If the game no longer exists and the og poster is no longer in the server or inactive, contact me ASAP to remove it or put up a back up version.<.>Bulk Buy and Bulk Sell do not scale with building prices. This is a common bug. Do not report it.<.>If your game has the discontinued label, only contact me when you plan on updating it once more.<//></><t><#404040>Game Labels</#><//></>Game labels are used to describe the state of a game. These vary from New to Top Rated #2 to Finished. Here's a list of all labels.<.>Having No label means it's just a game.<.>New - A New game added to the list. Applied til last day of month.<.>Top Rated - A game with a high amount of Cookies. Self Votes do not count for this total. Goes up to 5. Updated Weekly.<.>Agent's Picks - A label that the creator of this thing recommends. Not applied to his own games for obvious reasons<.>Hiatus - An Uncommon label that is only applied when you publicly announce it.<.>Finished - Another Uncommon label that is applied when announced.<.>Discontinued - A label used when you leave the DashNet Discord. Updates Monthly.<.>Archive - A label used for archived games. This only applied to games archived by me.<//></><t><#404040>Top 4 Highest Rated (Week of Oct. 1th, 2020)</#><//></>1 - Wall Destoryer (5 Cookies / Game Not Listed Here)</>2 - Item Smither / Pancake Maker (Combined with LSM) / Peanut Butter Cupper (2 Cookies)
	*PancakeMaker
		name:[Top Rated 2nd] Pancake Maker (By Agentperson)
		on click:log <t><#404040>Pancake Maker</>By Agentperson</#><//></><b>Description</b>: A game where you make pancakes to get profit, but this is not a traditional IGM game. Here you make pancakes by actually making them (Not Really. Mainly due to problems actually making it happen). Make Pancakes to make different kinds and get collectibles like Achievements and Useless Icons.<//></><b>Author's Note</b>: <q>I'm actually pretty impressive on how far this went without me wanting to end the project. My 1st and 2nd IGM game attempts weren't as good as this. In fact, it's actually unique in way. There's no IGM game I know of that shares similar mechanics to this one. It's basically a one of a kind. I hope you enjoy Pancake Maker.</q><//></>Replace "gUk4VbP6" with "rdekpqbD" to play the Regular version.<//></>Replace "gUk4VbP6" with "9wsbEZpP" to play the Mobile version which is best for smaller screens.<//></>
	*Breakify
		name:Breakify (By Alex)
		on click:log <t><#404040>Breakify</>By Alex</#><//></><b>Description</b>: Mine trough the moon!<//></>Replace "gUk4VbP6" with "79FjHmkG" to play.<//></>
	*ToTheAbyss
		name:To the Abyss (By Arinyl)
		on click:log <t><#404040>To the Abyss</>By Arinyl</#><//></><b>Description</b>: Do you have a fear of the unknown? I don't.<//></>Replace "gUk4VbP6" with "dMuY6RNi" to play.<//></>
	*Draconia
		name:Legend of Draconia: World Forge (By Blade Skydancer)
		on click:log <t><#404040>Legend of Draconia: World Forge</>By Blade Skydancer</#><//></><b>Description</b>: "You have drifted through nothingness for eons. Nothing but an endless sea of energies; untamed Fire, flowing Water, drifting Air, rumbling Earth, glowing Light and creeping Shadow. You pluck and weave these things together to create, making gems and rocks which float in space; the first physical objects. But now, you feel it's time for something new. Something different. For Life. You have created a very special rock, a planet, and imbued it with all of the elements. And now, your Children roam its surface." - Blade Skydancer (Found in Game's Description)<//></>Replace "gUk4VbP6" with "xfRJ91x1" to play.<//></>
	*WormClicker
		name:Worm Clicker (By CactusJupiter)
		on click:log <t><#404040>Worm Clicker</>By CactusJupiter</#><//></><b>Description</b>: An odd but amazing clicker that is in development.<//></>Replace "gUk4VbP6" with "VG5wP6Vh" to play.<//></>
	*FactoryClicker
		name:Factory Clicker (By CactusJupiter)
		on click:log <t><#404040>Factory Clicker</>By CactusJupiter</#><//></><b>Description</b>: Create things to make more complex things. Gets more difficult other time.<//></>Replace "gUk4VbP6" with "rXx208un" to play.<//></>
	*BallisticBosses
		name:Ballistic Bosses (By ChickenChronicles4)
		on click:log <t><#404040>Ballistic Bosses</>By ChickenChronicles4</#><//></><b>Description</b>:  A nice twist on the standard idle formula, where you train yourself in order to fight bosses! Many secrets await you, plus optional challenges for those who desire a harder experience.<//></>Replace "gUk4VbP6" with "v14FWQNk" to play.<//></>
	*PBC
		name:[Top Rated 2nd] Peanut Butter Cupper (By CriminalTurkey)
		on click:log <t><#404040>Peanut Butter Cupper</>By CriminalTurkey (AKA morkysherk)</#><//></><b>Description</b>:  Make some tasty peanut butter cups.<//></>Replace "gUk4VbP6" with "svQkcQVg" to play.<//></>
	*BankLover
		name:Bank Lover (By Dame-E-in)
		on click:log <t><#404040>Bank Lover</>By Dame-E-in</#><//></><b>Description</b>: Just an old game from beta that the creator was revamping while Cookie Clicker's in the background. The creator recommends that you turn on mouse keys. Also don't sell Police. Due to an IGM bug, the creator has made selling give you nothing back.<//></>Replace "gUk4VbP6" with "JFPiqCyc" to play.<//></>
	*DonutClicker
		name:[Discontinued] Donut Clicker (By donutask)
		on click:log <t><#404040>Donut Clicker</>By donutask</#><//></><b>Description</b>: Click the big donut to earn donuts. Use those donuts to buy buildings to produce donuts without clicking. Purchsae upgrades to improve idle donut production. Click the shiny Golden Donuts for a special currency. Also, hatch your own very own dragon.<//></>Replace "gUk4VbP6" with "f4Xh0mAX" to play.<//></>
	*CandyClicker
		name:[Discontinued] Candy Clicker (By emilioadalXD & HSJGERAMAD71)
		on click:log <t><#404040>Candy Clicker</>By emilioadalXD & HSJGERAMAD71</#><//></><b>Description</b>: A game where you make candy. Note that the creator is not good with English.<//></>Replace "gUk4VbP6" with "S1P1UZq5" to play.<//></>
	*GCR
		name:Grandma Clicker Reborn (By Eric)
		on click:log <t><#404040>Grandma Clicker Reborn</>By Eric</#><//></><b>Description</b>: Over 300 Upgrades, 400 Achievements, and 90+ Prestige Upgrades to unlock as you unlock a story about different Grandmas that tie all together with over 6 currencies and a never ending growing game!<//></><#404040><b>WARNING:</b>This game contains uncensored swearing and has offensive themes. Play at your own risk.</#><//></>Replace "gUk4VbP6" with "d2sgV1Ay" to play.<//></>
	*ThingGen
		name:Thing Generator (By Estrumbilo)
		on click:log <t><#404040>Thing Generator</>By Estrumbilo</#><//></><b>Description</b>: A game where you make things. Use these things to buy Thing Generators. You can also use these things to buy boosts that increase your things. Use things to make things. Use things to make a better description for this game. All of this except for the last one you can do. Just get ready to leave your computer idle.<//></>Replace "gUk4VbP6" with "Rgs8js0F" to play.<//></>
	*MineClicker
		name:Mine Clicker (By Evil Drake)
		on click:log <t><#404040>Mine Clicker</>By Evil Drake</#><//></><b>Description</b>: A game where you mine to get cash with +50 buildings, +500 achievements, +300 upgrades.<//></>Replace "gUk4VbP6" with "qzJTizd1" to play.<//></>
	*TokenMiner
		name:Token Miner (By DomNite (FrenzY))
		on click:log <t><#404040>Token Miner</>By DomNite (FrenzY))</#><//></><b>Description</b>:You alone are mining tokens, getting enchants on your character that give more tokens. Find Token Stones to unlock new Enchants by finding them and going to new Planets (basically prestige) and unlock Boosts. <b>Gods are watching you...</b></></>Featuring Anti-FastAutoClicker, Dark Mode, 170+ Achievements, Custom Layout, Max Token Drop and more!<//></>Replace "gUk4VbP6" with "Eu4fQRcp" to play. You may need to use your browser's Zoom feature (Desktop Only for Chrome and Microsoft Edge(?)) to see the entire game.<//></>
	*EnergyGenerator
		name:Energy Generator (By DomNite (FrenzY))
		on click:log <t><#404040>Energy Generator</>By DomNite (FrenzY) + 2 Helpers</#><//></><b>Description</b>: This game is about collecting energy, Many Upgrades, 80-100 Achievements, a few buildings, Prestige system(WIP), Experience system(WIP)<//></>Replace "gUk4VbP6" with "97kA7P7Z" to play.<//></>
	*ItemSmither
		name:[Top Rated 2nd] Item Smither (By Frostyclock and Frenzy)
		on click:log <t><#404040>Idle Cupcakes</>By Frostyclock and Frenzy</#><//></><b>Description</b>: Click the portal to earn materials, use the materials to craft special items!<//></>Replace "gUk4VbP6" with "8S7XVvp7" to play.<//></>
	*InatorGame
		name:The Inator Game (By Incremental)
		on click:log <t><#404040>The Inator Game</>By Incremental</#><//></><b>Description</b>: This is the game about inators. Probably filled with stupid puns...<//></>Replace "gUk4VbP6" with "RckMFc64" to play.<//></>
	*CandyEmp
		name:[Finished] Candy Emporium (By Incremental)
		on click:log <t><#404040>(Finished) Candy Emporium</>By Incremental</#><//></><b>Description</b>: Candy Emporium is a game, by Incremental, about making candy, until developing an existential crisis, plus a main antagonist appearing somewhere late-game. Can you get to the end?<//></>Replace "gUk4VbP6" with "9M7ULnFf" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/f2a98p/yeah_so_candy_emporium_is_finally_finished/
	*TheBlackSmith
		name:[Discontinued] The Blacksmith (By Law (Jelaw21))
		on click:log <t><#404040>The Blacksmith</>By Law (Jelaw21)</#><//></><b>Description</b>: Start with nothing and become a Master Blacksmith, rebuild the town of Rivervale and raise yourself to new heights. Featuring a quest system, awesome hammers and lots and lots of clicking.<//></>Replace "gUk4VbP6" with "5hk7Vpcu" to play.<//></>
	*Mine
		name:Stone Mine Simulator (Mine!) (By LGamePlayer13)
		on click:log <t><#404040>Stone Mine Simulator (Formerly known as Mine!)</>By LGamePlayer13</#><//></><b>Description</b>: A clicker game where you mine, explode, drill, and gain all the stone to rule!<//></>Replace "gUk4VbP6" with "Tk7HEsWV" to play.<//></>
	*AmusementPark
		name:[Hiatus] Amusement Park (By lLonewolf2121)
		on click:log <t><#404040>Amusement Park</>By lLonewolf2121r</#><//></><b>Description</b>: Build a amusement park and find out some dark secrets along the way.<//></>Replace "gUk4VbP6" with "czucP307" to play.<//></>
	*FatPigSimulator
		name:Fat Pig Simulator (By MaCRoYale and builder17)
		on click:log <t><#404040>Fat Pig Simulator</>By MaCRoYale and builder17</#><//></><b>Description</b>: Once upon a time, there was a pig called oinker, he liked food very much but he got bullied for being too fat :(. One day he got kicked out of the farm for eating all the other pig's food (Give him a break, he was hungry) and he was now homeless. His lifelong dream was to eat all the food in the world but in order to do that he needs your help, your clicking and your skills. (Found in Game's Description)<//></>Replace "gUk4VbP6" with "s2Tt60cK" to play.<//></>
	*ProjectPlusClicker
		name:[Discontinued] Project Plus Clicker (By Project Plus Clicker Development Team)
		on click:log <t><#404040>Project Plus Clicker</>By Project Plus Clicker Development Team</#><//></><b>Description</b>: Save Project Plus from the fateful day that happened long ago. With Milkowski Money on your side, you can save everyone. (This game was created for the creator's school class audience in mind. The upgrades or buildings are references you wont get.)<//></>Replace "gUk4VbP6" with "Cj14Y1EG" to play.<//></>
	*LSM
		name:[Archive] Legendary Super Miner (By RadicalRobot (Archived Agentperson))
		on click:log <t><#404040>Legendary Super Miner</>By RadicalRobot (Archived Agentperson)</#><//></><b>Description</b>: An archived version of the short lived game by the same name. It's another mining based game but there's different zones you can travel to to get different ores and stuff. (Originally from DashNet Forum)<//></><b>Note from Agentperson</b>: <q>This is honestly my favorite IGM game. While it doesn't take the engine mechanics to it's potential, it still makes for a fun game to spend some time with. Sadly, the Original Creator, RadicalRobot left the project shortly after the game broke, so I came in an fixed it for all to enjoy now. Have Fun!</q><//></>Replace "gUk4VbP6" with "J8A4TpxR" to play.<//></>
	*BrendanClickers
		name:Brendan Clickers (By Screaming)
		on click:log <t><#404040>Brendan Clickers</>By Screaming</#><//></><b>Description</b>: Will eventually be revisted probably.<//></>Replace "gUk4VbP6" with "R0tkzUJ2" to play.<//></>
	*Mint
		name:Mint Clicker (By TheRedstoneRazor (Two Pieces of Fried Tofu))
		on click:log <t><#404040>Mint Clicker</>By TheRedstoneRazor (Two Pieces of Fried Tofu)</#><//></><b>Description</b>: A game where you produce mint, and eventually maple to become the mintple overlord!<//></>Replace "gUk4VbP6" with "EyeTZySW" to play.<//></>
	*Sweetleaf
		name:[Finished] Sweetleaf Tycoon (By Tim "SoUlFaThEr" Lippert)
		on click:log <t><#404040>(Finished) Sweetleaf Tycoon</>By Tim "SoUlFaThEr" Lippert</#><//></><b>Description</b>: This is an idle clicker game about Mr. Joe Clicker and his innate desire to be the Kingpin of the fabled Sweetleaf.<//></>Replace "gUk4VbP6" with "7aP5n3Hv" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/b5gm4e/sweetleaf_tycoon/
	*IdleCupcakes
		name:Idle Cupcakes (By Waffle Gaming)
		on click:log <t><#404040>Idle Cupcakes</>By Waffle Gaming</#><//></><b>Description</b>: No description provided. :(<//></>Replace "gUk4VbP6" with "xzy3eUGc" to play.<//></>
	*TEMPLATE
		start with
		no buy
		no tooltip
		tag:GamesReddit
		on click:clear log
	*XmasTreeClicker
		name:Christmas Tree Clicker (By DoctorStick)
		on click:log <t><#404040>Christmas Tree Clicker</>By DoctorStick</#><//></><b>Description</b>: No trees were harmed in the making of this game.</>Replace "gUk4VbP6" with "UeQG3B2g" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/e6ndps/christmas_tree_clicker/
	*SpaceStationManager
		name:Space Station Manager (By Kasperja)
		on click:log <t><#404040>Space Station Manager</>By Kasperja</#><//></><b>Description</b>: Manage your station. Click your way to trade with the universe!<.><//><b>Credits:</b><.>Sprite parts: Space Ship & Mech Construction Kit 2 by Skorpio<//></>Replace "gUk4VbP6" with "WB3dAkaG" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/gv7wkz/space_station_manager_v_20_by_kasperja/
	*OrangeClicker
		name:Orange Clicker (By Laranjo Lokaum)
		on click:log <t><#404040>Orange Clicker</>By Laranjo Lokaum</#><//></><b>Description</b>: This is a simple game of Oranges.</>Replace "gUk4VbP6" with "1VHS5Wdx" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/gnz4bs/orange_clicker_v012/
	*BakeryIdle
		name:[Finished] Bakery Idle (By Op1010GamesYT)
		on click:log <t><#404040>(Finished) Bakery Idle</>By Op1010GamesYT</#><//></><b>Description</b>: Get ingredients, turn ingredients into dough, bake bread, sell, rinse and repeat. Don't worry, it's got more to it than just that.<//></>Replace "gUk4VbP6" with "AN1WYXJ7" to play.<//></>Posted at: https://www.reddit.com/r/idlegamemaker/comments/bcx3rq/bakery_idle/
	*TEMPLATE
		start with
		no buy
		no tooltip
		tag:GameInformation
		on click:clear log
	*RecommendedSources
		name:Recommend Sources
		on click:log <t><#404040>Recommended Sources</></>Communities</#><//></><b>Dashnet Discord Server</b></>You must be You need to be 13+ or the minimum age of digital consent in your country to use Discord. This is a requirement forced heavily in it's ToS and by many servers.</>https://discord.com/invite/cookie</></><b>r/idlegamemaker</b></>You must be 13+ or the minimum age of digital consent in your country to use Reddit.</></><t><#404040>Example Games</#><//></><b>Bunny Clicker by Orteil</b></>A template game that shows some of IGM's mechanics. Is free to use as a base for your game.</>http://orteil.dashnet.org/igm/?g=9HYzgPWX</></><b>1.00 KB Tutorial Game by FrenzY</b></>A game made to show new people how things work. It's much smaller than Bunny Clicker, but not as good.</>http://orteil.dashnet.org/igm/?g=ZTWQ79qk</></><b>Miner X by Agentperson</b></>Originally meant to be a spiritual successor to Legendary Super Miner. Got canceled in favor of other projects and that I also got writer's/developer's block. The game was supposed to be a Mining game mixed with RPG elements, such as a full battle system and different explorable locations. One of the reasons this got cancelled was that I was working on another game that is somewhat similar, thus this being dropped. I decided that this should be opened-sourced so here you go.</>http://orteil.dashnet.org/igm/?g=9HYzgPWX</></><b>Slime Farm by Agentperson</b></>Just like the above, this got canceled in favor of other projects. The game was supposed to be a Slime growing game where slimes can be named with predetermined names and be grown and mate with other slimes to create new breeds. Only the naming system was programmed in. Just like the above, this is open-sourced.</>http://orteil.dashnet.org/igm/?g=9HYzgPWX</></><t><#404040>Image Hosting Sites</#><//></><b>sta.sh</b></>An Image hosting site that requires an DeviantArt account.</></><b>pipe</b></>Another Image hosting site.</>https://miroware.io/pipe/</></><t><#404040>Misc.</#><//></><b>CSS Tutorial by w3schools.com</b></>A part of a site where you learn CSS. Mentioned in the Offical Handbook made by Orteil.</>https://www.w3schools.com/css/</></>`)
		.map(val => JSON.stringify(val))
		.join("\n")
)
