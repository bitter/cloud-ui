require({ 
            baseUrl: '.',
            priority: ['jquery/jquery-1.5.1'], 
            urlArgs: "bust=" +  (new Date()).getTime() 
        },
        [
            'modules/browser/jquery-ui-support', 
            'aws/AWS', 
            'aws/AWSDummy',
            'text!settings.json',
            'modules/browser/RunInstancesDialog', 
            'modules/browser/InfoMessage', 
            'modules/jquery.ui.awsTable',
            'jquery/jquery.tablesorter'
        ],
    function ($, AWS, AWSDummy, settingsText, RunInstancesDialog, InfoMessage) {

        var strings = {
            refresh: "Updating table data...",
            error: "Unable to retrieve data from server"
        };

        var settings = JSON.parse(settingsText);

        $('#tabs').tabs();
        $('.draggable').draggable({handle: '.draggable-handle'});

        var aws = !settings.ec2.dummy
            ? new AWS(settings.ec2)
            : new AWSDummy();
        
        $('#connection').attr('src', aws.createURL({ action: 'DescribeAvailabilityZones', params: {'ZoneName.1': 'verbose'} }));

        function createEc2AjaxTab(selector, action, params, itemSelector, valueSelectors, rowListener) {
            var awsTable = $(selector + " > tbody").awsTable({
                                                                 aws: aws,
                                                                 action: action,
                                                                 parameters: params,
                                                                 itemSelector: itemSelector,
                                                                 valueSelectors: valueSelectors,
                                                                 rowModifier: rowListener,
                                                                 autoRefresh: 60000
                                                             });
            var table = awsTable.parent('table');
            table.tablesorter();
            $(".refresh-ec2-table").click(function() {
                awsTable.awsTable('refresh');
            });
            var info = $(".refresh-ec2-table-status");
            awsTable.awsTable('refresh', function(event) {
                info.removeClass('refresh success error');
                if (event == 'success') {
                    table.trigger('update');
                    info.text(aws.formatDate(new Date(), "ddd dd MMM hh:mm:ss"));
                } else {
                    info.text(strings[event]);
                }
                info.addClass(event);
            });
            return awsTable;
        }

        var runInstancesDialog = new RunInstancesDialog(aws);
        var columns;
        columns = ['imageId', 'imageLocation'];
        var imagesTable = createEc2AjaxTab("#images-table", "DescribeImages", { 'Owner': ['self'] }, 'item', columns, function(key, data, row) {
            $("<span class='ui-icon ui-icon-circle-triangle-e' />").appendTo($("<td>").prependTo(row)).click(function() {
                runInstancesDialog.open(key, function(result) {
                    instanceTable.awsTable('refresh');
                    $('#tabs').tabs('select', '#instances');
                });
            });
            return row;
        });

        columns = ['instanceId', 'instanceType', 'imageId', 'keyName', 'instanceState > name', 'dnsName'];
        var instanceTable = createEc2AjaxTab("#instances-table", "DescribeInstances", {  }, 'instancesSet > item', columns , function(key, data, row) {
            var uptimeTd = $("<td>").appendTo(row);
            var launchTimeStr = $('launchTime', data).text();
            if (launchTimeStr) {
                var nowTimeDate = new Date();
                var nowTime = nowTimeDate.getTime() + nowTimeDate.getTimezoneOffset() * 60000;
                var launchTime = aws.parseDate(launchTimeStr).getTime();
                var uptime = parseInt((nowTime - launchTime) / 1000);
                var uptimeString = (uptime % 60) + " sec ";
                var uptimeMinutes = parseInt(uptime / 60);
                if (uptimeMinutes) {
                    uptimeString = (uptimeMinutes % 60) + " min ";
                }
                var uptimeHours = parseInt(uptimeMinutes / 60);
                if (uptimeHours) {
                    uptimeString += (uptimeHours % 24) + " hours ";
                }
                var uptimeDays = parseInt(uptimeHours / 24);
                if (uptimeDays) {
                    uptimeString += uptimeDays + " days ";
                }
                uptimeTd.text(uptimeString);
            }
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
