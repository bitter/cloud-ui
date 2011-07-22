define(['./jquery-ui-widget-support', './jquery.childUpdate', './jquery.pjstApply', 'jquery/jquery.xml2json'], function($) {

     function clearPreviousTimeout(awsElement) {
         awsElement._timerId && clearTimeout(awsElement._timerId);
     }

     function resetTimeout(awsElement) {
         clearPreviousTimeout(awsElement);
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
             }
         },
         _create: function() {
             this._listeners = [];
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
         _fire: function() {
             var event = arguments;
             this._listeners.forEach(function(listener) {
                 listener.apply(this, event);
             });
         },
         refresh: function(listener) {

             if (listener) {
                 this._listeners.push(listener);
                 return this;
             }

             var self = this, options = self.options, jqElement = self.element;
             self._fire('refresh');
             clearPreviousTimeout(self);
             options.aws.invoke({ action: options.action, params: options.parameters, success: function(data, textStatus, jqXHR) {
                 var items = $(options.itemSelector, data).map(function(_, itemXML) {
                     return options.itemGenerator.call(self, itemXML);
                 }).toArray();
                 jqElement.childUpdate('elements', items);
                 jqElement.childUpdate({'tagAddedElements': true});
                 self._fire('success', items);
                 resetTimeout(self);
             }, 
             error: function(jqXHR, textStatus, errorThrown) {
                 self._fire('error', textStatus, errorThrown);
                 resetTimeout(self);
             }});
             return this;
         }
     });
});
