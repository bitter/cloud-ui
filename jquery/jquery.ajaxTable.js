(function($) {

     $.fn.ajaxTable = function(dataCallback, rowUpdateCallback) {
   
         var jqTable = this, timerId;

         jqTable.ajaxTable = {};
         jqTable.ajaxTable.refresh = function() {
             dataCallback.call(this, function(frequency, items) {
                 if (items) {
                     var newRows = {};
       
                     var jqTableBody = $('tbody', jqTable);
                     if (!jqTableBody.length) {
                         jqTableBody = jqTable;
                     }
       
                     items.forEach(function(item) {
                         var jqRow = $('<tr>');
                         jqRow.data('ajaxTable.key', item.key);
                         item.forEach(function(value) {
                             jqRow.append($('<td>').text(value));
                         });
                         newRows[item.key] = jqRow;
                     });
       
                     $('tr', jqTableBody).each(function(_, row) {
                         var jqRow = $(row);
                         var key = jqRow.data('ajaxTable.key');
                         if (key != undefined) {
                             if (newRows[key]) {
                                 rowUpdateCallback(key, newRows[key], jqRow);
                                 jqRow.replaceWith(newRows[key]);
                                 delete newRows[key];
                             } else {
                                 jqRow.css({'background-color': '#dddddd'});
                                 jqRow.animate({ opacity:0 }, 5000, function() {
                                     jqRow.remove();
                                 });
                             }
                         }
                     });
                     
                     for (var key in newRows) {
                         rowUpdateCallback(key, newRows[key]);
                         newRows[key].appendTo(jqTableBody);
                     }
                 }
                 // Make sure we only have one scheduled timer
                 if (timerId) {
                     clearTimeout(timerId);
                 }
                 timerId = setTimeout(jqTable.ajaxTable.refresh, frequency);
             });
         };
         jqTable.ajaxTable.refresh();

         return jqTable;
     };
   
})(jQuery);