require({ priority: ['jquery/jquery-1.5.1'], urlArgs: "bust=" +  (new Date()).getTime() },
        [
            'modules/jquery-ui-support', 
            'aws/AWS', 
            'aws/AWSDummy',
            'text!settings.json',
            'modules/RunInstancesDialog.js', 
            'modules/InfoMessage', 
            'modules/jquery.ui.awsTable'],
    function ($, AWS, AWSDummy, settingsText, RunInstancesDialog, InfoMessage) {

        var settings = JSON.parse(settingsText);

        $('#tabs').tabs();
        $('.draggable').draggable({handle: '.draggable-handle'});

        var aws = !settings.ec2.dummy
            ? new AWS(settings.ec2)
            : new AWSDummy();
        
        $('#connection').attr('src', aws.createURL({ action: 'DescribeAvailabilityZones', params: {'ZoneName.1': 'verbose'} }));

        function createEc2AjaxTab(selector, action, params, itemSelector, valueSelectors, rowListener) {
            return $(selector).awsTable({
                                            aws: aws, 
                                            action: action, 
                                            parameters: params, 
                                            itemSelector: itemSelector, 
                                            valueSelectors: valueSelectors, 
                                            rowModifier: rowListener, 
                                            autoRefresh: 10000
                                        });
        }

        var runInstancesDialog = new RunInstancesDialog(aws);
        var columns;
        columns = ['imageId', 'imageLocation'];
        var imagesTable = createEc2AjaxTab("#images-table", "DescribeImages", { 'Owner': ['self'] }, 'item', columns, function(key, row) {
            $("<span class='ui-icon ui-icon-circle-triangle-e' />").appendTo($("<td>").prependTo(row)).click(function() {
                runInstancesDialog.open(key, function(result) {
                    instanceTable.awsTable('refresh');
                    $('#tabs').tabs('select', '#instances');
                });
            });
            return row;
        });

        columns = ['instanceId', 'instanceType', 'imageId', 'keyName', 'instanceState > name', 'dnsName'];
        var instanceTable = createEc2AjaxTab("#instances-table", "DescribeInstances", {  }, 'instancesSet > item', columns , function(key, row) {
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
                                   instanceTable.awsTable('refresh');
                                   $('#tabs').tabs('select', '#instances');
                               }, 
                               error: function(result) {
                                   alert($('Message', result.responseText).text());
                               } 
                           });
            });
            return row;
        });

        columns = ['zoneName', 'zoneState' ];
        var status = createEc2AjaxTab("#status-table", "DescribeAvailabilityZones", { ZoneName: ['verbose'] }, 'availabilityZoneInfo > item', columns);
});
