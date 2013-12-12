$("#navbar").load("navbar.html");
//some value of plot
var line1 = [14, 32, 41, 44, 40];
var line2 = [10, 20, 30, 40, 50];

//Patient X first plot
var patientxplot1 = $.jqplot('patientx-chart1', [line1, line2], {
    title : 'V',
    captureRightClick : true,
    //isDragable : true,
    //stackSeries: true,
    legend : {
        show : true,
        location : 'ne'
    },
    series : [{
        label : 'class1'
    }, {
        label : 'class2'
    }],
    seriesDefaults : {
        renderer : $.jqplot.BarRenderer,
        //rendererOptions:{barMargin: 25},
        pointLabels : {
            show : true,
            stackedValue : true
        }
    },
    axes : {
        xaxis : {
            renderer : $.jqplot.CategoryAxisRenderer,
            label : 'X Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        },
        yaxis : {
            padMax : 1.3,
            label : 'Y Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        }
    },
    cursor : {
        style : 'crosshair',
        show : true,
        showTooltip : true,
        followMouse : true,
        tooltipLocation : 'nw',
        tooltipOffset : 6,
        showTooltipGridPosition : false,
        showTooltipUnitPosition : true
    },
    highlighter : {
        sizeAdjust : 10,
        tooltipLocation : 'n',
        tooltipAxes : 'y',
        tooltipFormatString : 'Metric: %.2f',
        useAxesFormatters : false
    }
});

//second
var patientxplot2 = $.jqplot('patientx-chart2', [line1, line2], {
    title : 'D',
    //isDragable : true,
    //stackSeries: true,
    legend : {
        show : true,
        location : 'ne'
    },
    series : [{
        label : 'class1'
    }, {
        label : 'class2'
    }],
    seriesDefaults : {
        renderer : $.jqplot.BarRenderer,
        //rendererOptions:{barMargin: 25},
        pointLabels : {
            show : true,
            stackedValue : true
        }
    },
    axes : {
        xaxis : {
            renderer : $.jqplot.CategoryAxisRenderer,
            label : 'X Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        },
        yaxis : {
            padMax : 1.3,
            label : 'Y Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        }
    },
    cursor : {
        style : 'crosshair',
        show : true,
        showTooltip : true,
        followMouse : true,
        tooltipLocation : 'nw',
        tooltipOffset : 6,
        showTooltipGridPosition : false,
        showTooltipUnitPosition : true
    }
});

//third
var patientxplot3 = $.jqplot('patientx-chart3', [line1, line2], {
    title : 'J',
    //isDragable : true,
    //stackSeries: true,
    legend : {
        show : true,
        location : 'ne'
    },
    series : [{
        label : 'class1'
    }, {
        label : 'class2'
    }],
    seriesDefaults : {
        renderer : $.jqplot.BarRenderer,
        //rendererOptions:{barMargin: 25},
        pointLabels : {
            show : true,
            stackedValue : true
        }
    },
    axes : {
        xaxis : {
            renderer : $.jqplot.CategoryAxisRenderer,
            label : 'X Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        },
        yaxis : {
            padMax : 1.3,
            label : 'Y Title',
            labelRenderer : $.jqplot.CanvasAxisLabelRenderer
        }
    },
    cursor : {
        style : 'crosshair',
        show : true,
        showTooltip : true,
        followMouse : true,
        tooltipLocation : 'nw',
        tooltipOffset : 6,
        showTooltipGridPosition : false,
        showTooltipUnitPosition : true
    }
});

$('#patientx-chart1').bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data) {
    $('#info1c').html('series: ' + seriesIndex + ', point: ' + pointIndex + ', data: ' + data);
});
$('#patientx-chart1').bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
    $('#info1b').html('series: ' + seriesIndex + ', point: ' + pointIndex + ', data: ' + data + ', pageX: ' + ev.pageX + ', pageY: ' + ev.pageY);
});
$('#patientx-chart1').bind('jqplotDataUnhighlight', function(ev) {
    $('#info1b').html('Nothing');
});
// patientxplot2;patientxplot3;
// $(document).ready(function() { patientxplot1;
// });

