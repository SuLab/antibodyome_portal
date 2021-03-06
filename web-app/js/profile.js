$("#navbar").load("navbar.html");

var bar_color = [{
    'family' : "rgba(0, 0, 0, 1.0)",
    'genes' : "rgba(0, 0, 0, 0.5)",
    'alleles' : "rgba(0, 0, 0, 0.3)"
    }, {
        'family' : "rgba(0, 0, 0, 1.0)",
        'genes' : "rgba(0, 0, 0, 0.5)",
        'alleles' : "rgba(0, 0, 0, 0.3)"
    }
];
var bar_height = {
    'family' : 24,
    'genes' : 12,
    'alleles' : 10
};
var bar_gap = {
    'family' : 10,
    'genes' : 2,
    'alleles' : 1
};

var PAGE_SIZE = 21;
var current_page = 0;
var next_page = false;
var filter = '';
//var pagination_init = false;

var getRGBColorFromHex = function(color_num, type) {
    color_codes = ['9400D3', '2F4F4F', '483D8B', '8FBC8B', 'E9967A', '8B0000', '9932CC', 'FF8C00', '556B2F', '8B008B', 'BDB76B', '7FFFD4', 'A9A9A9', 'B8860B', '008B8B', '00008B', '00FFFF', 'DC143C', '6495ED', 'FF7F50', 'D2691E', '7FFF00', '5F9EA0', 'DEB887', 'A52A2A', '8A2BE2', '0000FF', '000000', 'FFE4C4', '006400', '00FFFF'];
    if (color_num > color_codes.length) {
        color_num = (color_num % color_codes.length) - 1;
    }
    var hex = color_codes[color_num];
    if (hex == undefined) {
        hex = color_codes[0];
    }

    // Convert hex color value to RGB
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    if (type == "family") {
        return "rgba(" + r + ", " + g + ", " + b + ", 1)";
    }
    if (type == "genes") {
        return "rgba(" + r + ", " + g + ", " + b + ", 0.6)";
    }
    if (type == "alleles") {
        return "rgba(" + r + ", " + g + ", " + b + ", 0.3)";
    }

};

function clone(obj) {
    var objClone;
    if (obj.constructor == Object) {
        objClone = new obj.constructor();
    } else {
        objClone = new obj.constructor(obj.valueOf());
    }
    for (var key in obj) {
        if (objClone[key] != obj[key]) {
            if ( typeof (obj[key]) == 'object') {
                objClone[key] = clone(obj[key]);
            } else {
                objClone[key] = obj[key];
            }
        }
    }
    return objClone;
}

$.urlParam = function(name) {
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return results[1] || 0;
};


//显示灰色JS遮罩层
function showBg(ct,content){
    var bH=$("body").height();
    var bW=$("body").width()+16;
    var objWH=getObjWh(ct);
    $("#fullbg").css({width:bW,height:bH,display:"block"});
    var tbT=objWH.split("|")[0]+"px";
    var tbL=objWH.split("|")[1]+"px";
    $("#"+ct).css({top:tbT,left:tbL,display:"block"});
    $("#"+content).html("<div style='text-align:center'><img src='3rd/icon/load4.gif' alt='Loading' style='width: 50px;'></div>");
    $(window).scroll(function(){resetBg();});
    $(window).resize(function(){resetBg();});
}
function getObjWh(obj){
    var st=document.documentElement.scrollTop;//滚动条距顶部的距离
    var sl=document.documentElement.scrollLeft;//滚动条距左边的距离
    var ch=document.documentElement.clientHeight;//屏幕的高度
    var cw=document.documentElement.clientWidth;//屏幕的宽度
    var objH=$("#"+obj).height();//浮动对象的高度
    var objW=$("#"+obj).width();//浮动对象的宽度
    var objT=Number(st)+(Number(ch)-Number(objH))/2;
    var objL=Number(sl)+(Number(cw)-Number(objW))/2;
    return objT+"|"+objL;
}
function resetBg(){
    var fullbg=$("#fullbg").css("display");
    if(fullbg=="block"){
        var bH2=$("body").height();
        var bW2=$("body").width()+16;
        $("#fullbg").css({width:bW2,height:bH2});
        var objV=getObjWh("dialog");
        var tbT=objV.split("|")[0]+"px";
        var tbL=objV.split("|")[1]+"px";
        $("#dialog").css({top:tbT,left:tbL});
    }
}

//关闭灰色JS遮罩层和操作窗口
function closeBg(){
    $("#dialog").css("display","none");
    $("#fullbg").css("display","none");
}

$(document).ready(function() {
    var abs_id = $.urlParam('abs_id');
    var abp_id = $.urlParam('abp_id');

    $('#project-link').attr('href', '/web-app/project_detail.html?abp_id=' + abp_id);
    $("#svg-div").css("overflow", "hidden");
    $.ajax({
        url : '/upload/sample-ab/' + abs_id + '/',
        type : 'GET',
        success : function(res) {
            if (res.code != 0)
            {
                $('#list-ab-modal .modal-body').text(res.details);
                $('#list-ab-modal').modal('show');
                return;
            }
            res = res.details;
            $('#title').append(res.sample.name);
            $('#desc').append(res.sample.name);
            $('#file').append(res.sample.file);
            p_h = data_process(res['heavy']);
            render_d3_bar(p_h['v'], res['heavy']['total'], '.profile_v_h');
            render_d3_bar(p_h['d'], res['heavy']['total'], '.profile_d_h');
            render_d3_bar(p_h['j'], res['heavy']['total'], '.profile_j_h');
            light = combine_light(res['kappa'], res['lambda']);
            p_l = data_process(light);
            render_d3_bar(p_l['v'], light['total'], '.profile_v_l');
            render_d3_bar(p_l['j'], light['total'], '.profile_j_l');
            total_ab = res.heavy.total + res.kappa.total + res.lambda.total;
            refresh_ab_list(current_page, true);
        }
    });

    $("#go").click(function() {
        $("#antibodyome").addClass("active in");
        $("#chart,#table").removeClass("active in");
        $("#heavy_tab, #light_tab").removeClass("active");
        $("#antibodyome_tab").addClass("active");

        current_page = 0;
        update_filter();
        refresh_ab_list(current_page, true);
        $('#abs_count').text('counting total Abs number...');
    });

    $('.prev_page').click(function(){
        current_page = current_page-1;
        refresh_ab_list(current_page, false);
    });

    $('.next_page').click(function(){
        current_page = current_page+1;
        refresh_ab_list(current_page, false);
    });

    $('#list-ab-modal #cancel_modal').click(function(event) {
        $('#list-ab-modal').modal('hide');
    });
});

var count_xhr=null;

var extend = function(o, n, override) {
    for (var p in n)
    if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))
        o[p] = n[p];
};

function update_filter()
{
    var is = $(".random_list a i");
    if (is.length > 0) {
        var dict = {};
        for (var i = 0; i < is.length; i++) {
            extend(dict, JSON.parse(is.eq(i).attr('filter')));
        }
        filter = JSON.stringify(dict);
    }
    else
    {
        filter='';
    }
}

function refresh_ab_list(p, update_count) {
    var abs_id = $.urlParam('abs_id');
    var abp_id = $.urlParam('abp_id');

    showBg('dialog','dialog_content');

    $('.ab_list').html('');
    $('.prev_page').addClass('disabled');
    $('.next_page').addClass('disabled');
    if (count_xhr != null && update_count)
    {
        count_xhr.abort();
    }
    $.ajax({
        url : '/upload/ab-list/' + abs_id + '/',
        type : 'GET',
        data : {
            'filters' : filter,
            'start' : p * (PAGE_SIZE-1),
            'limit' : PAGE_SIZE,
        },
        dataType : 'json',
        success : function(res) {
            closeBg();
            if (res.code != 0)
            {
                $('#list-ab-modal .modal-body').text(res.details);
                $('#list-ab-modal').modal('show');
                return;
            }
            var l = res.details.length;
            var html = '<table class="table table-striped table-hover table-bordered"><tbody><tr><th>id</th><th>v-gene</th><th>d-gene</th><th>j-gene</th></tr>';
            if(l==PAGE_SIZE)
            {
                $('.next_page').removeClass('disabled');
            }

            if(current_page > 0)
            {
                $('.prev_page').removeClass('disabled');
            }

            show_res = res.details.slice(0, PAGE_SIZE-1);
            $.each(res.details, function(i, e) {
                html += '<tr class="ab_item" style="cursor: pointer;" onclick="window.location.href=\'abome_ab.html?abs_id=' + abs_id + '&abp_id=' + abp_id + '&ab=' + e.id + '\'"><td>' + e.id + '</td><td>' + e.v_gene_full + '</td><td>' + e.d_gene_full + '</td><td>' + e.j_gene_full + '</td></tr>';
            });
            html += '</tbody></table>';
            $('.ab_list').html(html);
            if(!update_count)
            {
                return;
            }
            if (filter=='')
            {
                $('#abs_count').text(total_ab+' Abs in total');
                return;
            }

            if(l<PAGE_SIZE)
            {
                $('#abs_count').text(l+' Abs in total');
                return;
            }
            count_xhr = $.ajax({
                url : '/upload/ab-count/' + abs_id + '/',
                type : 'GET',
                data : {
                    'filters' : filter,
                },
                dataType : 'json',
                success : function(res) {
                    count_xhr = null;
                    if (res.code == 0)
                        $('#abs_count').text(res.details+' Abs in total');
                }
            });
        }
    });
}

function combine_light(kappa, lambda) {
    var light = clone(kappa);
    light.total += lambda.total;
    for (var v1 in lambda.v) {
        if ( v1 in light) {
            light.v[v1] += lambda.v[v1];
        } else {
            light.v[v1] = lambda.v[v1];
        }
    }

    for (var v1 in lambda.j) {
        if ( v1 in light) {
            light.j[v1] += lambda.j[v1];
        } else {
            light.j[v1] = lambda.j[v1];
        }
    }
    return light;
}

function downloadURL(url) {
    var hiddenIFrameID = 'hiddenDownloader', iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
};

function submit_download_form(selector, output_format) {
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString($(selector+' svg')[0]);
    data = {
        'output_format' : output_format,
        'svg' : svg_xml,
    };
    $.post('/upload/convert-svg/', data, function(res) {
        downloadURL(res);
    });
}

function trim(str) {//删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

function render_d3_bar(obj, total, selector) {
    var width = 850, bar_max = 700, tick = 10;
    var zoom = 1;
    var data = map_to_array(obj);

    $(selector + " #save_to_svg").click(function() {
        submit_download_form(selector, "svg");
    });
    $(selector + " #save_to_pdf").click(function() {
        submit_download_form(selector, "pdf");
    });
    $(selector + " #save_to_png").click(function() {
        submit_download_form(selector, "png");
    });

    function clear_svg() {
        d3.select(selector + ' svg').selectAll("g").remove();
        d3.select(selector + ' svg').selectAll("line").remove();
    }


    $(selector).find('.refresh').click(function() {
        clear_svg();
        zoom = 1;
        data = map_to_array(obj);
        bar_render(zoom, tick);
    });

    $(selector).find('.zoom-in').click(function() {
        clear_svg();
        zoom = zoom * 1.2;
        bar_render(zoom, tick);
    });

    $(selector).find('.zoom-out').click(function() {
        clear_svg();
        zoom = zoom * 0.8;
        bar_render(zoom, tick);
    });
    bar_render(zoom, tick);
    $(selector + " #button-div").removeClass("hide");
    function bar_render(zoom, tick) {
        function to_percent(count) {
            return 100 * count / total;
        }

        function to_percent_float(count) {
            return (100 * count / total).toFixed(2);
        }

        function doClick(d, i) {
            if (d.type == 'alleles')
                return;
            if (!d.clicked) {
                data = array_join_at(data, d.children, i);
            } else {
                data_pop_at(data, i);
            }
            d3.select(selector + ' svg').selectAll("g").remove();
            d3.select(selector + ' svg').selectAll("line").remove();
            bar_render(zoom, tick);
        }

        var barHeight = 20;
        var y_trans = 0, x_trans = 108;

        var chart = d3.select(selector + ' svg').attr("width", width);

        var xScale = d3.scale.linear().domain([0, 100 / zoom]).range([0, bar_max]);
        var yScale = d3.scale.ordinal().domain($.map(data, function(value, key) {
            return value.name;
        })).rangeRoundBands([0, barHeight * data.length], 0);

        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(tick);
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var bar = chart.selectAll("g").data(data).enter().append("g").attr("transform", function(d, i) {
            ret = "translate(" + x_trans + "," + y_trans + ")";
            y_trans += (bar_height[d.type]);
            return ret;
        });

        chart.attr("height", y_trans + 30);

        var barset = chart.append("g").attr("class", "x axis").call(xAxis).attr("transform", function(d, i) {
            return "translate(" + (x_trans - 1) + ", " + y_trans + ")";
        });

        var smallLine = barset.selectAll("g");
        smallLine.selectAll("line").attr("fill", "none").attr("stroke", "#000").attr("shape-rendering", "crispEdges");
        smallLine.selectAll("text").attr("font-size", "14px");
        barset.selectAll("path").attr("fill", "none").attr("stroke", "#000").attr("shape-rendering", "crispEdges");
        bar.append("rect").style("fill", function(d) {
            return getRGBColorFromHex(d.color, d.type);

        }).style("cursor", function(d, i) {
            if (d.type == "family" || d.type == "genes")
                return "pointer";
            return "default";
        }).attr("y", function(d, i) {
            return bar_gap[d.type];
        }).attr("width", function(d, i) {
            // if(xScale(to_percent(d.count))>width){
            // return width-120;
            // }
            return xScale(to_percent(d.count));
        }).attr("height", function(d, i) {
            return bar_height[d.type] - bar_gap[d.type];
        }).on("click", function(d, i) {
            doClick(d, i);
        });

        bar.append("text").attr("x", function(d, i) {
            return xScale(to_percent(d.count)) + 5;
        }).attr("y", function(d, i) {
            return bar_height[d.type] / 2;
        }).attr("dy", function(d, i) {
            if (d.type == 'alleles')
                return ".4em";
            if (d.type == 'genes')
                return ".5em";
            return ".6em";
        }).style("fill", function(d) {
            return bar_color[0][d.type];
        }).style("font-size", function(d) {
            if (d.type == 'alleles')
                return "9px";
            if (d.type == 'genes')
                return "11px";
            return "13px";
        }).on("click", function(d, i) {
            doClick(d, i);
        }).text(function(d, i) {
            return to_percent_float(d.count) + '%';
        });

        // new code
        bar.append("text").attr("x", function(d, i) {
            if (to_percent(d.count) >= 10) {
                return xScale(to_percent(d.count)) + 52;
            } else {
                return xScale(to_percent(d.count)) + 45;
            }

        }).attr("y", function(d, i) {
            return bar_height[d.type] / 2;
        }).attr("dy", function(d, i) {
            if (d.type == 'alleles')
                return ".44em";
            if (d.type == 'genes')
                return ".54em";
            return ".64em";
        }).style("fill", function(d) {
            return bar_color[0][d.type];
        }).style("font-size", function(d) {
            if (d.type == 'alleles')
                return "8px";
            if (d.type == 'genes')
                return "10px";
            return "12px";
        }).on("click", function(d, i) {
            doClick(d, i);
        }).text(function(d, i) {
            return "(" + d.count + ")";
        });
        // end new code

        bar.append("text").attr("x", function(d, i) {
            if (d.type == 'alleles')
            {
                return -40;
            }
            if (d.type == 'genes')
            {
                 if(d.family != null)
                 {
                     return -60;
                 }
                 else
                 {
                     return -100;
                 }
            }
            return -100;
        }).attr("y", function(d, i) {
            return bar_height[d.type] / 2;
        }).attr("dy", function(d, i) {
            if (d.type == 'alleles')
                return ".5em";
            if (d.type == 'genes')
                return ".5em";
            return ".7em";
        }).style("cursor", function(d, i) {
            return "pointer";
        }).style("fill", function(d) {
            return bar_color[0][d.type];
        }).style("font-size", function(d) {
            if (d.type == 'alleles')
                return "10px";
            if (d.type == 'genes')
                return "12px";
            return "15px";
        }).on("click", function(d, i) {// 图表标签点击事件,再此可判断有无重复元素
            var f = g = a = '', t, type;
            //t -- f, g, a; type--v,d,j
            t = d.type;
            if (d.type == 'family') {
                f = d.name;
                type = d.name[3].toLowerCase();
            } else {
                if (d.family == null)//j gene
                {
                    type = 'j';
                    if (d.type == 'genes') {
                        g = d.name;
                    } else {
                        g = d.gene;
                        a = d.name;
                    }
                } else {
                    f = d.family;
                    type = d.family[3].toLowerCase();
                    if (d.type == 'genes') {
                        g = d.name;
                    } else {
                        g = d.gene;
                        a = d.name;
                    }
                }
            }
            if(type=='v')
                type = 'Variable: ';
            else if(type=='d')
                type = 'Diversity: ';
            else
                type = 'Joining: ';
            if(type=='Joining: ')
            {
                var txt = type + g;
                if(a!='')
                    txt = txt + '*' + a;
            }
            else
            {
                var txt = type + f;
                if(g!='')
                    txt = txt + '-' + g;
                if(a!='')
                    txt = txt +'*' + a;
            }
            //construct filter {'v_gene':{'fam':'xx', 'gene':'xx', 'all':'xx'}}
            var filter = {};
            var key = type[0].toLowerCase()+'_gene';
            filter[key] = {};
            if (type=='Joining: ')
            {
                filter[key].gene =g.substring(4);
                if(a!='')
                {
                    filter[key].all = a;
                }
            }
            else
            {
                filter[key].fam = f.substring(4);
                if(g!='')
                {
                    filter[key].gene = g;
                }
                if(a!='')
                {
                    filter[key].all =a;
                }
            }
            filter_str = JSON.stringify(filter);
            var is = $(".random_list a i");
            var i = 0;
            for (; i < is.length; i++) {
                if (type[0] == is.eq(i).text()[0]) {
                    is.eq(i).text(txt);
                    is.eq(i).attr({'filter':filter_str});
                    break;
                }
            }

            if (type == 'Variable: ')
                color = "#5cb85c";
            else if(type=='Diversity: ')
                color = "#f0ad4e";
            else if(type=='Joining: ')
                color = "#d9534f";
            if (i >= is.length) {
                $(".random_list").append('<a class="btn btn-default btn-xs" role="button" style="margin: 2px; background-color:'+color+';" onclick="$(this).remove();" href=' + 'javascript:void(0);><i filter='+filter_str+'>' + txt + '</i>&nbsp<span class="glyphicon glyphicon-remove"></span></a>');
            }
        }).text(function(d, i) {
            if (d.type == 'alleles')
            {
                return '*'+d.name;
            }
            if (d.type == 'genes')
            {
                 if(d.family != null)
                 {
                     return '-'+d.name;
                 }
            }
            return d.name;
        });

        chart.append("line").attr("x1", x_trans - 1).attr("y1", 0).attr("x2", x_trans - 1).attr("y2", y_trans).attr("stroke-width", 1).attr("stroke", "black");
    }

}

//remove different type data after index i
function data_pop_at(a, i) {
    var type = a[i].type;
    var j = i + 1;

    while (a[j] && a[j].type != type) {
        if (a[j].type == "family")
            break;
        j++;
    }
    a[i].clicked = false;
    a.splice(i + 1, j - i - 1);
}

function array_join_at(a_d, a_s, i) {
    var a_new = new Array();
    for (var j = 0; j <= i; j++) {
        if (j == i) {
            a_d[j].clicked = true;
            a_new.push(a_d[j]);
        } else {
            a_new.push(a_d[j]);
        }
    }
    a_new = a_new.concat(a_s);
    for (var j = i + 1; j < a_d.length; j++) {
        a_new.push(a_d[j]);
    }
    return a_new;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }
    return size;
};

function gene_parse(k) {
    var res = {
        'family' : null,
        'gene' : null,
        'allele' : null
    };
    var t, s;
    t = k.indexOf('-');
    if (t == -1) {
        t = k.indexOf('/');
    }
    if (t != -1) {
        s = k.substring(t + 1, k.length);
        res['family'] = k.substring(0, t);
        res['gene'] = s.split('*')[0];
        res['allele'] = s.split('*')[1];
        //res['gene'] = res['family'] + '-' + s.split('*')[0];
        //res['allele'] = k;
    } else {
        //j gene has no family
        res['gene'] = k.split('*')[0];
        res['allele'] = k.split('*')[1];
        //res['allele'] = k;
    }
    return res;
}

function gene_parse_4_ab_filter(k) {
    var res = { };
    var type = k[3].toLowerCase() + '_gene';
    var t, s;
    //family和gene以/ 或者 -间隔
    t = k.indexOf('-');
    if (t == -1) {
        t = k.indexOf('/');
    }
    if (t != -1) {
        s = k.substring(t + 1, k.length);
        res['fam'] = k.substring(4, t);
        var split = s.split('*');
        res['gene'] = split[0];
        if (split.length > 1) {
            res['all'] = split[1];
        }
    } else//没有gene的情况 family和alleles以*间隔 或者只是family
    {
        var split = k.split('*');
        res['fam'] = split[0].substring(4);
        if (split.length > 1) {
            res['all'] = split[1];
        }
    }
    ret = {}
    ret[type] = res;
    return ret;
}

function sort_key(data, flag) {
    var keys = [];
    var indexs = [];
    var items = {};
    if (flag) {
        $.map(data, function(value, index) {
            keys.push(value.name);
        });
        var items = keys.map(function(e, i) {
            return {
                index : i,
                value : e
            };
        });
        items.sort(function(a, b) {
            return a.value > b.value ? 1 : -1;
        });
        return items;
    } else {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
    }

    return keys;
}

function map_to_array(origin_data) {
    var new_data = [];
    var new_genes = [];
    var i = 0;

    family_array = sort_key(origin_data);
    $.map(family_array, function(value1) {
        var key = Object.keys(origin_data[value1].children)[0];
        if (origin_data[value1].children[key].type == 'alleles') {
            var new_alleles = [];
            var f = origin_data[value1];
            alleles_items = sort_key(f['children'], 1);
            for (var key in alleles_items) {
                f['children'][alleles_items[key].index].color = i;
                f['children'][alleles_items[key].index].clicked = false;
                f['children'][alleles_items[key].index].gene = value1;
                new_alleles.push(f.children[alleles_items[key].index]);
            }
            f.children = new_alleles;
        } else {
            var new_genes = [];
            gene_array = sort_key(origin_data[value1].children);
            $.map(gene_array, function(value2) {
                var new_alleles = [];
                var g = origin_data[value1].children[value2];
                alleles_items = sort_key(g['children'], 1);
                for (var key in alleles_items) {
                    g['children'][alleles_items[key].index].color = i;
                    g['children'][alleles_items[key].index].clicked = false;
                    g['children'][alleles_items[key].index].gene = value2;
                    g['children'][alleles_items[key].index].family = value1;
                    g.family = value1;
                    new_alleles.push(g.children[alleles_items[key].index]);
                }
                g.color = i;
                g.children = new_alleles;
                g.clicked = false;
                new_genes.push(g);
            });
            origin_data[value1]['children'].parent_name = value1;
            origin_data[value1]['children'] = new_genes;
        }
        origin_data[value1].color = i;
        origin_data[value1].clicked = false;
        //origin_data[value1].parent_name = value1;
        new_data.push(origin_data[value1]);
        i = i + 1;
    });
    return new_data;
}

//raw --- {'total':xxxx, 'd':{}, 'j':{}, 'v':{}}
function data_process(raw) {
    var res = {};
    total = raw['total'];
    var trees = {};
    for (var key in raw) {
        if (key == 'total')
            continue;
        res[key] = {};
        var parsed, alleles = {}, tree = {};
        for (var k1 in raw[key]) {
            parsed = gene_parse(k1);
            parsed['val'] = raw[key][k1];
            alleles[k1] = parsed;
        }
        res[key] = alleles;
        for (var k2 in alleles) {
            var f = alleles[k2]['family'];
            var g = alleles[k2]['gene'];
            var v = alleles[k2]['val'];
            var allele = new Object;
            allele['name'] = alleles[k2]['allele'];
            allele['count'] = v;
            allele['type'] = 'alleles';
            var root = f;
            if (f == null)
                root = g
            if ( root in tree) {
                tree[root]['count'] += v;
                //root is family
                if (f != null) {
                    if ( g in tree[root]['children']) {
                        tree[root]['children'][g]['count'] += v;
                        tree[root]['children'][g]['type'] = 'genes';
                        tree[root]['children'][g]['name'] = g;
                        tree[root]['children'][g]['children'].push(allele);
                    } else {
                        tree[f]['children'][g] = {
                            'count' : v,
                            'type' : 'genes',
                            'name' : g,
                            'children' : [allele]
                        };
                    }
                } else {//root is gene
                    tree[root]['children'].push(allele);
                }
            } else {
                if (f != null) {
                    tree[root] = {
                        'count' : v,
                        'name' : f,
                        'type' : 'family'
                    };
                    tree[root]['children'] = {};
                    tree[root]['children'][g] = {
                        'count' : v,
                        'type' : 'genes',
                        'name' : g,
                        'children' : [allele]
                    };
                } else//no family only gene, for j gene
                {
                    tree[root] = {
                        'count' : v,
                        'name' : g,
                        'type' : 'genes',
                        'children' : [allele]
                    };
                }
            }
        }
        trees[key] = tree;
    }
    return trees;
}

