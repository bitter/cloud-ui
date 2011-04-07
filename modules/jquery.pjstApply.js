/**
 * This is a restructured version of the PureJSTemplate by 
 * Mohammad S. Rahman which is licensed under "MohammadLicense"
 * 
 * http://www.javascriptr.com/2008/06/05/purejstemplate-a-pure-javascript-templating-engine-for-jquery/
 * 
 * I'm not sure if you are actually allowed to re-write the code the
 * way I've done it, but if not: Muhammad come get me ;)
 * 
 **/
define(['./jquery-ui-support'], function($) {

     function stringStartsWith(str, startsWith) {
	 return str.substring(0, startsWith.length)==startsWith;
     }

     // Parser setup
     var leftjs = String.fromCharCode(21);
     var leftjsout = leftjs + "=";

     var specials = [ '$','^','?','/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ];
     var escapeRegex = new RegExp( '(\\' + specials.join('|\\') + ')', 'g');
     var replaceSingleQuote = new RegExp("'","g");
     var replaceLineBreak = new RegExp("\\r|\\n", "g");

     function setupParser(left, right) {
	 var escapedLeft = left.replace(escapeRegex, '\\$1');
	 var escapedRight = right.replace(escapeRegex, '\\$1');
         return {
             left: left,
             right: right,
             replaceLeft: new RegExp(escapedLeft, "g"),
             replaceSingleQuote: replaceSingleQuote,
             replaceLineBreak: replaceLineBreak,
             regexLeftRight: new RegExp(escapedLeft + "|" + escapedRight, "g")
         };
     };
     var defaultParser = setupParser("{:", ":}");

     // Create template function
     function createTemplate(template, parser) {

	 template = template.replace(parser.replaceLeft, parser.left + leftjs);
			
	 var templateSplit = template.split(parser.regexLeftRight);
	 var js="var data=arguments[0], output='', ld='" + parser.left + "', rd='" + parser.right + "';\n ";
	 for(var i = 0; i < templateSplit.length; i++) {
	     var line = templateSplit[i];
	     js +=
                 stringStartsWith(line, leftjsout) ? " output+=" + line.substring(leftjsout.length) + ";\n" :
                 stringStartsWith(line, leftjs) ? " " + line.substring(leftjs.length) + " " : 
                 " output+='" + line.replace(parser.replaceSingleQuote, "\\'").replace(parser.replaceLineBreak, ' ') + "';\n ";
	 }
	 js += " return output;";

	 try {
	     return new Function(js);
         } catch(e) {
             throw "Parse error in template function:\n" + js;
         }
     }

     // Template function generator
     $.fn.pjstApply=function(data) {
         var template = this.data('pjstApply');
         if (!template) {
             var parent = this.parent();
             if (!parent.length) {
                 parent = $('<parent>').append(this);
             }
             template = createTemplate(parent.html(), defaultParser);
             this.data('pjstApply', template);
         }
         return $(template.call(this, data));
     };
});
