## Anvil CSSLint Plugin

This plugin requires anvil.js version 0.8.* or greater.

## Installation

```text
	anvil install anvil.csslint
```

## Usage

After you have installed the plugin you first need to reference the plugin inside the `dependencies` key of your `build.json`.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		// Required settings here...
	}
}
```

Then you will need to choose one of the following senarios in order for the plugin to know which files to lint.

* Linting all your files
* Linting Specifc Files
* Linting All Files Except

### Settings

#### Linting all your files

Let's say that you had 5 CSS files in your `src` folder and you wanted all of them to be linted when you build your project. The following `"all": true` setting will tell `anvil.csslint` that you want everything to be linted.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"all": true
	}
}
```

#### Linting Specific Files

If you had 5 CSS files in your `src` folder and you only wanted a specific subset of those to be linted, then you could use the `include` setting and provide a list of files you want to include in the linting process.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"include": [ "main.css" ]
	}
}
```

#### Linting All Files Except

If you had 5 CSS files in your `src` folder and you wanted most of them to be linted, but to ignore a couple of items, then you could use the `exclude` setting and provide a list of files you want to exclude in the linting process.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"exclude": [ "util.css" ]
	}
}
```

#### Breaking Build Option

By default if there are any errors that CSSLint returns then the build process will be aborted. You can override this option by providing setting the `breakBuild` to `false`.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"all": true,
		"breakBuild": false
	}
}
```

#### Ignore Specific Errors

Sometimes there are CSSLint errors that for one reason or another you want ignored by the build process. To do that you can provide an `ignore` option with a list of all the errors that you feel are acceptable for your project. You list the `line`, `character`, and `reason` (contains) of each error you'd like to ignore. You can provide a combination of these options for more or less flexibility.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"all": true,
		"ignore": [
			{ "line": 81, "col": 26, "message": "Expected COLON at line" },
			... other options ...
		]
	}
}
```

The following option ignores message for line 1 and col 15

```javascript
{ "line": 1, "col": 15, "message": "Expected COLON at line 1, col 15." }
```

The following option ignores any error on line 81 and col 12

```javascript
{ "line": 81, "col": 12 }
```

The following option ignores message anywhere on line 81

```javascript
{ "line": 81, "message": "Don't use IDs in selectors." }
```

The following option ignores any errors on line 81

```javascript
{ "line": 81 }
```

The following option ignores any errors matching message anywhere in the file

```javascript
{ "message": "Don't use adjoining classes." }
```

#### CSSLint Settings

You can always provide custom CSSLint and global comments to the top of each of your CSS file to tweak it's lint `ruleset` settings, but that can be redundant and a nuisance. So, you can provide these common settings in your 'anvil.csslint' settings to be used during the linting process. For more information about these seeting check the official [wiki](https://github.com/stubbornella/csslint/wiki/Rules).

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.csslint" ],
	"anvil.csslint": {
		"all": true,
		"ruleset": {
			"important":1,
			"adjoining-classes":1,
			"known-properties":1,
			"box-sizing":1,
			"box-model":1,
			"outline-none":1,
			"duplicate-background-images":1,
			"compatible-vendor-prefixes":1,
			"display-property-grouping":1,
			"qualified-headings":1,
			"fallback-colors":1,
			"duplicate-properties":1,
			"empty-rules":1,
			"errors":1,
			"shorthand":1,
			"ids":1,
			"gradients":1,
			"font-sizes":1,
			"font-faces":1,
			"floats":1,
			"underscore-property-hack":1,
			"overqualified-elements":1,
			"import":1,
			"regex-selectors":1,
			"rules-count":1,
			"star-property-hack":1,
			"text-indent":1,
			"unique-headings":1,
			"universal-selector":1,
			"unqualified-attributes":1,
			"vendor-prefix":1,
			"zero-units":1
		}
	}
}
```

## Uninstallation

```text
	anvil uninstall anvil.csslint
```
