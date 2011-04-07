define(['./jquery-ui-support', './jquery.childUpdate', './jquery.pjstApply', 'jquery/jquery.xml2json'], function($) {

     var null_callbacks = {
         success: function() {},
         error: function() {}
     };

     $.widget("ui.awsElement",
     {
         // default options
         options: {
             aws: undefined,
             action: undefined,
             parameters: [],
             itemSelector: '',
             autoRefresh: 0,
             itemTemplate: $("<p key='{:=JSON.stringify(data)]_'>_[=JSON.stringify(data):}</p>"),
             itemGenerator: function(xmlItem) {
                 return this.options.itemTemplate.pjstApply($.xml2json(xmlItem));
             },
             success: function() {},
             error: function() {}
         },
         _create: function() {
             this.element.addClass("ui-awselement ui-widget");             
             this.element.childUpdate();
             this.refresh();
             this.autoRefresh(this.options.autoRefresh);
         },
	 _destroy: function() {
	     this.element.removeClass( "ui-awselement ui-widget" );
	 },
         _setOption: function(key, value) {
	     if (key === 'autoRefresh') {
                 this.autoRefresh(value);
	     }
	     return this._super('_setOption', key, value);
	 },         
         refresh: function() {
             var self = this, options = self.options, jqElement = self.element;
             options.aws.invoke({ action: options.action, params: options.parameters, success: function(data, textStatus, jqXHR) {
                 var items = $(options.itemSelector, data).map(function(_, itemXML) {
                     return options.itemGenerator.call(self, itemXML);
                 });
                 jqElement.childUpdate('elements', items);
                 options.success.call(jqElement, data, textStatus, jqXHR);
             }, 
             error: function(jqXHR, textStatus, errorThrown) {
                 options.error.call(jqElement, jqXHR, textStatus, errorThrown);
             }});
             return this;
         },
         autoRefresh: function(frequency) {
             var jqElement = this;
             if (frequency) {
                 function invokeRefresh() {
                     jqElement.refresh();
                 }
                 jqElement._timerId = setInterval(invokeRefresh, frequency);

             } else if (jqElement._timerId) {
                 clearInterval(jqElement._timerId);
             }
             return this;
         }
     });
});
