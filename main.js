require({
            priority: ['jquery/jquery-1.5.1'], 
            urlArgs: "bust=" +  (new Date()).getTime() 
        },
        ['aws/AWS', 'aws/AWSDummy','modules/jquery-ui-support', 'modules/RunInstancesDialog.js', 'modules/InfoMessage', 'jquery/jquery.ajaxTable'],
        function (AWS, AWSDummy, $, RunInstancesDialog, InfoMessage) {

        $('#tabs').tabs();
        $('.draggable').draggable({handle: '.draggable-handle'});

        var aws = new AWSDummy();
        $('#connection').attr('src', aws.createURL({ action: 'DescribeAvailabilityZones', params: {'ZoneName.1': 'verbose'} }));

        function createEc2AjaxTab(selector, action, params, itemSelector, keySelector, valueSelectors, rowListener) {
            return $(selector).ajaxTable(function(callback) {
                aws.invoke({ action: action, params: params, success: function(result) {
                    var items = [];
                    $(itemSelector, result).each(function(_, itemXML) {
                        var $item = $(itemXML);
                        var tablerow = [];
                        tablerow.key = $(keySelector, $item).text();
                        valueSelectors.forEach(function(valueSelector) {
                            tablerow.push($(valueSelector, $item).text());
                        });
                        items.push(tablerow);
                    });
                    callback(10000, items);
                    
                }, error: function() {
                    callback(5000);
                }});
            }, rowListener);
        }

        var runInstancesDialog = new RunInstancesDialog(aws);
        var columns;
        columns = ['imageId', 'imageLocation'];
        var imagesTable = createEc2AjaxTab("#images-table", "DescribeImages", { 'Owner': ['self'] }, 'item', 'imageId', columns, function(key, row) {
            $("<span class='ui-icon ui-icon-circle-triangle-e' />").appendTo($("<td>").prependTo(row)).click(function() {
                runInstancesDialog.open(key, function(result) {
                    instanceTable.ajaxTable.refresh();
                    $('#tabs').tabs('select', '#instances');
                });
            });
        });

        columns = ['instanceId', 'instanceType', 'imageId', 'keyName', 'instanceState > name', 'dnsName'];
        var instanceTable = createEc2AjaxTab("#instances-table", "DescribeInstances", {  }, 'instancesSet > item', 'instanceId', columns , function(key, row) {
            $("<span class='ui-icon ui-icon-circle-close' />").appendTo($("<td>").prependTo(row)).click(function() {
                new InfoMessage('Terminate Instance', $("<p>Terminating <b>" + key + "</b></p>"), 10000);
                aws.invoke({ 
                               action: 'TerminateInstances', 
                               params: { InstanceId: key }, 
                               success: function(result) {
                                   
                                   var infoMessage = "<p>Termination request acknowledged";
                                   $('instancesSet >item > instanceId', result).each(function(_, idTag) {
                                       infoMessage += "<br><b>" + $(idTag).text() + "</b>";
                                   });
                                   infoMessage += "</p>";
                                   new InfoMessage('Terminate Instances', $(infoMessage), 10000);
                                   instanceTable.ajaxTable.refresh();
                                   $('#tabs').tabs('select', '#instances');
                               }, 
                               error: function(result) {
                                   alert($('Message', result.responseText).text());
                               } 
                           });
            });
        });        

        columns = ['zoneName', 'zoneState' ];
        createEc2AjaxTab("#status-table", "DescribeAvailabilityZones", { ZoneName: ['verbose'] }, 'availabilityZoneInfo > item', 'zoneName', columns , function(key, row) {
    });
});
