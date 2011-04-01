define(['./jquery-ui-support'], function($) {

     var settings = {
         keyColumnIndex: 0,
         deleterow: function() {
             this.css({'background-color': '#dddddd'});
             this.animate({ opacity:0 }, 5000, function() {
                 $(this).remove();
             });
         }
     };

     var tableUpdate = {
         init : function(options) {
             var options = $.extend({}, settings, options);
             return this.data('tableUpdate.options', options);
         },
         rows: function(rows) {

             var options = this.data('tableUpdate.options'), jqRows = $(rows);
             function resolveKey(row) {
                 return row.attr('tableUpdate.key');
             }

             var newRows = {}, jqTableBody = $('tbody', this);
             if (jqRows) {
                 jqRows.each(function(_, row) {
                     newRows[resolveKey(row)] = row;
                 });
                 $('tr', jqTableBody).each(function(_, row) {
                     var jqRow = $(row);
                     var key = resolveKey(jqRow);
                     if (key != undefined) {
                         if (newRows[key]) {
                             if (!jqRow.data('tableUpdate.deleteState')) {
                                 jqRow.replaceWith(newRows[key]);
                                 delete newRows[key];
                             }
                         } else {
                             jqRow.data('tableUpdate.deleteState', true);
                             options.deleterow.call(jqRow);
                         }
                     }
                 });

                 for (var key in newRows) {
                     newRows[key].appendTo(jqTableBody);
                 }
             }
             return this;
         }
     };

     $.fn.tableUpdate = function(method) {
         if (tableUpdate[arguments[0]]) {
             return tableUpdate[method].apply(this, Array.prototype.slice.call(arguments, 1));
         } else if (typeof method === 'object' || !method) {
             return tableUpdate.init.apply(this, arguments);
         } else {
             $.error('Method ' +  method + ' does not exist on jQuery.tooltip');
         }
         return this;
     };
});