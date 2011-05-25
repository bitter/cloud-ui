define(['./jquery-ui-widget-support', './jquery.childUpdate', './jquery.pjstApply', 'jquery/jquery.xml2json'], function($) {

     var null_callbacks = {
         success: function() {},
         error: function() {}
     };

     function clearTimeout(awsElement) {
         awsElement._timerId && clearTimeout(awsElement._timerId);
     }

     function resetTimeout(awsElement) {
         clearTimeout(awsElement);
         awsElement._timerId = setTimeout(function() {
             awsElement.refresh();
         }, awsElement.options.autoRefresh);
     }

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
         },
	 _destroy: function() {
	     this.element.removeClass( "ui-awselement ui-widget" );
	 },
         _setOption: function(key, value) {
             try {
                 return this._super('_setOption', key, value);
             } finally {
	         if (key === 'autoRefresh') {
                     resetTimeout(this);
	         }
             }
	 },
         refresh: function() {
             var self = this, options = self.options, jqElement = self.element;
             clearTimeout(self);
             options.aws.invoke({ action: options.action, params: options.parameters, success: function(data, textStatus, jqXHR) {
                 var items = $(options.itemSelector, data).map(function(_, itemXML) {
                     return options.itemGenerator.call(self, itemXML);
                 }).toArray();
                 jqElement.childUpdate('elements', items);
                 options.success.call(jqElement, data, textStatus, jqXHR);
                 resetTimeout(self);
             }, 
             error: function(jqXHR, textStatus, errorThrown) {
                 options.error.call(jqElement, jqXHR, textStatus, errorThrown);
                 resetTimeout(self);
             }});
             return this;
         }
     });
});
