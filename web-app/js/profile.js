$("#navbar").load("navbar.html");
//data for profile_v
var vvalue = new Array();
var varray = new Array();

//data for profile_d
var dvalue = new Array();
var darray = new Array();

//data for profile_j
var jvalue = new Array();
var jarray = new Array();

var v_count = {
    "IGHV1-18*01" : 86735,
};

var d_count = {
    "IGHD1-1*01" : 58327,
};

var j_count = {
    "IGHJ3*01" : 11757,
};

$(document).ready(function() {
    $.urlParam = function(name){
        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return results[1] || 0;
    }
    var id = $.urlParam('id');
    $.get('/upload/sample-ab/'+id, function(res){
        console.log(res);
        v_count = res.variable;
        d_count = res.diversity;
        j_count = res.joining;
        console.log(v_count['IGHV1-69*01']);
        setPlotAndSidebarValue();
        setPlot();
    });


});

function setPlotAndSidebarValue(){
    var i = 1;
    $.each(v_count, function(key, value) {
        vvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        $('.variable-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
        i++;
    });
    i = 0;
    varray.push(vvalue);
    $.each(d_count, function(key, value) {
        dvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        $('.diversity-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
        i++;
    });
    i = 0;
    darray.push(dvalue);

    $.each(j_count, function(key, value) {
        jvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        $('.joining-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
        i++;
    });
    i = 0;
    jarray.push(jvalue);

    //set the height of plot
    $("#profile-v").css("height", function() {
        return vvalue.length * 20;
    });
    $("#profile-d").css("height", function() {
        return dvalue.length * 20;
    });
    $("#profile-j").css("height", function() {
        return jvalue.length * 20;
    });

}
function setPlot() {
    //横向柱状图
    profilev = $.jqplot('profile-v', varray, {
        seriesDefaults : {
            renderer : $.jqplot.BarRenderer,
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15,
                ypadding : 32
            },
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15
            },
            shadow : false,
            rendererOptions : {
                //barPadding : 8, //设置同一分类两个柱状条之间的距离（px）
                //barMargin : 10, //设置不同分类的两个柱状条之间的距离（px）（同一个横坐标表点上）
                barDirection : 'horizontal', //设置柱状图显示的方向：垂直显示和水平显示
                //，默认垂直显示 vertical or horizontal.
                barWidth : 10, // 设置柱状图中每个柱状条的宽度
            }
        },
        axes : {
            yaxis : {
                renderer : $.jqplot.CategoryAxisRenderer
            }
        },
        cursor : {
            style : 'crosshair',
            show : true,
            showTooltip : false,
            followMouse : true,
            tooltipLocation : 'nw',
            tooltipOffset : 6,
            showTooltipGridPosition : false,
            showTooltipUnitPosition : false
        }
    });

    profiled = $.jqplot('profile-d', darray, {
        seriesDefaults : {
            renderer : $.jqplot.BarRenderer,
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15,
                ypadding : 32
            },
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15
            },
            shadow : false,
            rendererOptions : {
                barDirection : 'horizontal',
                barWidth : 10,
            }
        },
        axes : {
            yaxis : {
                renderer : $.jqplot.CategoryAxisRenderer
            }
        },
        cursor : {
            style : 'crosshair',
            show : true,
            showTooltip : false,
            followMouse : true,
            tooltipLocation : 'nw',
            tooltipOffset : 6,
            showTooltipGridPosition : false,
            showTooltipUnitPosition : true
        }
    });

    profilej = $.jqplot('profile-j', jarray, {
        seriesDefaults : {
            renderer : $.jqplot.BarRenderer,
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15,
                ypadding : 32
            },
            pointLabels : {
                show : true,
                location : 'e',
                edgeTolerance : -15
            },
            shadow : false,
            rendererOptions : {
                barDirection : 'horizontal',
                barWidth : 10,
            }
        },
        axes : {
            yaxis : {
                renderer : $.jqplot.CategoryAxisRenderer
            }
        },
        cursor : {
            style : 'crosshair',
            show : true,
            showTooltip : false,
            followMouse : true,
            tooltipLocation : 'nw',
            tooltipOffset : 6,
            showTooltipGridPosition : false,
            showTooltipUnitPosition : true
        }
    });


}

