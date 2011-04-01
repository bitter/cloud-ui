define(['./jquery-ui-support', './jquery.tableUpdate'], function($) {

     var null_callbacks = {
         success: function() {},
         error: function() {}
     };

     $.widget("ui.awsTable",
     {
         // default options
         options: {
             aws: undefined,
             action: undefined,
             parameters: [],
             itemSelector: '',
             keySelector: undefined,
             valueSelectors: [],
             autoRefresh: 0,
             rowModifier: function(key, row) { return row; },
             success: function() {},
             error: function() {}
         },
         _create: function() {
             this.element.addClass("ui-awstable ui-widget");
             this.element.tableUpdate();
             this.refresh();
             this.autoRefresh(this.options.autoRefresh);
         },
	 _destroy: function() {
	     this.element.removeClass( "ui-awstable ui-widget" );
	 },
         _setOption: function(key, value) {
	     if (key === 'autoRefresh') {
                 this.autoRefresh(value);
	     }
	     this._super('_setOption', key, value);
	 },         
         refresh: function() {
             var jqElement = this.element, options = this.options;
             options.aws.invoke({ action: options.action, params: options.parameters, success: function(data, textStatus, jqXHR) {
                 var rows = $(options.itemSelector, data).map(function(_, itemXML) {
                     var jqItem = $(itemXML),
                            key = $(options.keySelector || options.valueSelectors[0], jqItem).text(),
                          jqRow = $('<tr>').attr('tableUpdate.key', key);
                     options.valueSelectors.forEach(function(valueSelector) {
                         $('<td>').text($(valueSelector, jqItem).text()).appendTo(jqRow);
                     });
                     return options.rowModifier(key, jqRow);
                 });
                 jqElement.tableUpdate('rows', rows);
                 options.success(data, textStatus, jqXHR);
             }, 
             error: function(jqXHR, textStatus, errorThrown) {
                 options.error(jqXHR, textStatus, errorThrown);
             }});
         },
         autoRefresh: function(frequency) {
             var jqTable = this;
             if (frequency) {
                 function invokeRefresh() {
                     console.log('refresh');
                     jqTable.refresh();
                 }
                 jqTable._timerId = setInterval(invokeRefresh, frequency);
                 console.log("tid:" + jqTable._timerId);

             } else if (jqTable._timerId) {
                 clearInterval(jqTable._timerId);
             }
         }
     });
});
