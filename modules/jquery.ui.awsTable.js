define(['./jquery-ui-support', './jquery.ui.awsElement'], function($) {

     $.widget("ui.awsTable", $.ui.awsElement,
     {
         // default options
         options: {
             keySelector: undefined,
             valueSelectors: [],
             rowModifier: function(key, row) { return row; }
         },
         _create: function() {
             var self = this;
             this.options.itemGenerator = function(jqItem) {
                 var key = $(self.options.keySelector || self.options.valueSelectors[0], jqItem).text(),
                     jqRow = $('<tr>').attr('key', key);
                 self.options.valueSelectors.forEach(function(valueSelector) {
                     $('<td>').text($(valueSelector, jqItem).text()).appendTo(jqRow);
                 });
                 return self.options.rowModifier(key, jqRow);
             };
             $.ui.awsElement.prototype._create.call(this);
         }
     });
});
