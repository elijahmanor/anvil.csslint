/*
 * anvil.csslint - CSSLint plugin for anvil.js
 * version:	0.0.1
 * author: Elijah Manor <elijah.manor@gmail.com> (http://elijahmanor.com)
 * copyright: 2011 - 2012
 * license:	Dual licensed
 * - MIT (http://www.opensource.org/licenses/mit-license)
 * - GPL (http://www.opensource.org/licenses/gpl-license)
 */
var csslint = require( "csslint" ).CSSLint;
var colors = require( "colors" );

colors.setTheme({
  verbose: "cyan",
  info: "green",
  warn: "yellow",
  debug: "blue",
  error: "red",
  data: "grey"
});

var csslintFactory = function( _, anvil ) {
	_.str = require( "underscore.string" );
	_.mixin( _.str.exports() );

	return anvil.plugin({
		name: "anvil.csslint",
		activity: "pre-process",
		all: false,
		inclusive: false,
		exclusive: false,
		breakBuild: true,
		ignore: null,
		ruleset: {},
		fileList: [],
		commander: [
			[ "--csslint", "CSSLint all CSS files" ]
		],

		configure: function( config, command, done ) {
			if ( !_.isEmpty( this.config ) ) {
				if ( this.config.all ) {
					this.all = true;
				} else if ( this.config.include && this.config.include.length  ) {
					this.inclusive = true;
					this.fileList = this.config.include;
				} else if ( this.config.exclude && this.config.exclude.length ) {
					this.exclusive = true;
					this.fileList = this.config.exclude;
				}
				this.ruleset = this.config.ruleset || {};
				anvil.log.event( "ruleset: " + JSON.stringify( this.ruleset ) );
				this.breakBuild = this.config.breakBuild === false ?
					this.config.breakBuild : this.breakBuild;
				this.ignore = this.config.ignore || [];
			} else if ( command.csslint ) {
				this.all = true;
			}

			done();
		},

		run: function( done ) {
			var jsFiles = [],
				options = {},
				that = this,
				totalErrors = 0,
				transforms;

			if ( this.inclusive ) {
				jsFiles = _.filter( anvil.project.files, this.anyFile( this.fileList ) );
			} else if ( this.all || this.exclusive ) {
				jsFiles = _.filter( anvil.project.files, function( file ) {
					return file.extension() === ".css";
				});
				if ( this.exclusive ) {
					jsFiles = _.reject( jsFiles, this.anyFile( this.fileList ) );
				}
			}

			if ( jsFiles.length > 0 ) {
				anvil.log.step( "Linting " + jsFiles.length + " files" );
				transforms = _.map( jsFiles, function( file ) {
					return function( done ) {
						that.lint( file, function( numberOfErrors ) {
							totalErrors += numberOfErrors;
							done();
						});
					};
				});
				anvil.scheduler.pipeline( undefined, transforms, function() {
					if ( that.breakBuild === true &&
						_.isNumber( totalErrors ) && totalErrors > 0 ) {
						anvil.events.raise( "build.stop", "project has " + totalErrors + ( totalErrors === 1 ? " error!" : " errors!" ) );
					}
					done();
				});
			} else {
				done();
			}
		},

		anyFile: function( list ) {
			return function( file ) {
				return _.any( list, function( name ) {
					var alias = anvil.fs.buildPath( [ file.relativePath, file.name ] );
					return name === alias || ( "/" + name ) == alias;
				});
			};
		},

		lint: function( file, done ) {
			var that = this;

			anvil.log.event( "Linting '" + file.fullPath + "'" );
			anvil.fs.read( [ file.fullPath ], function( content, err ) {
				if ( !err ) {
					that.lintContent( content, function( numberOfErrors ) {
						done( numberOfErrors );
					});
				} else {
					anvil.log.error( "Error reading " + file.fullPath + " for linting: \n" + err.stack  );
					done({});
				}
			});
		},

		lintContent: function( content, done ) {
			var result = csslint.verify( content, this.ruleset || {} ),
				validMessages = [], numberOfErrors = 0, numberOfWarnings = 0, numberIgnored = 0;

			if ( !result.messages.length ) {
				anvil.log.event( "No issues Found." );
			} else {
				validMessages = this.processMessages( result.messages, this.ignore );
				_.each( validMessages, function( message ) {
					console.log( message.message );
				});

				numberOfWarnings = _.filter( validMessages, function( message ) { return message.type === "warning"; } ).length;
				if ( numberOfWarnings ) {
					anvil.log.event( numberOfWarnings + ( numberOfWarnings === 1 ? " warning found." : " warnings found." ) );
				}

				numberOfErrors = _.filter( validMessages, function( message ) { return message.type === "error"; } ).length;
				if ( numberOfErrors ) {
					anvil.log.event( numberOfErrors + ( numberOfErrors === 1 ? " error found." : " errors found." ) );
				}

				numberIgnored = result.messages.length - validMessages.length;
				if ( this.ignore.length && numberIgnored ) {
					anvil.log.event( numberIgnored + ( numberIgnored === 1 ? " issue ignored." : " issues ignored." ) );
				}
			}

			done( numberOfErrors );
		},

		processMessages: function( messages, ignore ) {
			var result = [], padding = {}, that = this;

			padding = {
				line: _.reduce( messages, function( memo, message ) {
					if ( message && message.line.toString().length > memo.toString().length ) {
						memo = message.line.toString();
					}
					return memo;
				}, "" ).length,
				col: _.reduce( messages, function( memo, message ) {
					if ( message && message.col.toString().length > memo.toString().length ) {
						memo = message.col.toString();
					}
					return memo;
				}, "" ).length
			};

			_.each( messages, function( message ) {
				if ( message && message.evidence ) {
					if ( !that.isIgnorable( message, ignore ) ) {
						result.push({
							type: message.type,
							message: that.formatMessage( message, padding )
						});
					}
				}
			});

			return result;
		},

		formatMessage: function( message, padding ) {
			var formatted = "[L".data + _.lpad( message.line, padding.line, "0" ).data + ":C".data + _.lpad( message.col, padding.col, "0" ).data + "] ".data;

			if ( message.type === "warning" ) {
				formatted += message.evidence.replace( /^\s*/g, "" ).italic.warn + " -> ".data + message.message.bold.warn;
			} else if ( message.type === "error" ) {
				formatted += message.evidence.replace( /^\s*/g, "" ).italic.error + " -> ".data + message.message.bold.error;
			}

			return formatted;
		},

		/*
		 * The following option ignores message for line 1 and col 15
		 * { "line": 1, "col": 15, "message": "Expected COLON at line 1, col 15." }
		 *
		 * The following option ignores any error on line 81 and col 12
		 * { "line": 81, "col": 12 }
		 *
		 * The following option ignores message anywhere on line 81
		 * { "line": 81, "message": "Don't use IDs in selectors." }
		 *
		 * The following option ignores any errors on line 81
		 * { "line": 81 }
		 *
		 * The following option ignores any errors matching message anywhere in the file
		 * { "message": "Don't use adjoining classes." }
		 */
		isIgnorable: function( message, ignoreList ) {
			var ignorable = false;

			ignorable = _.any( ignoreList, function( ignore ) {
				return message.line === message.line && message.col === ignore.col && message.message.indexOf( ignore.message ) > -1;
			});
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return message.line === ignore.line && message.col === ignore.col && !ignore.message;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return message.line === ignore.line && !ignore.col && message.message.indexOf( ignore.message ) > -1;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return message.line === ignore.line && !ignore.col && !ignore.message;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return !ignore.line && !ignore.col && message.message.indexOf( ignore.message ) > -1;
				});
			}

			return ignorable;
		}
	});
};

module.exports = csslintFactory;