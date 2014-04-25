$("#navbar").load("navbar.html");

var bar_color = [{'family':"rgba(0, 0, 0, 1.0)",'genes':"rgba(0, 0, 0, 0.5)",'alleles':"rgba(0, 0, 0, 0.3)"}, {'family':"rgba(0, 0, 0, 1.0)",'genes':"rgba(0, 0, 0, 0.5)",'alleles':"rgba(0, 0, 0, 0.3)"}]
var bar_height = {'family':24, 'genes':12, 'alleles':10}
var bar_gap = {'family':10, 'genes':2, 'alleles':1}

var getRGBColorFromHex=function(color_num, type) {
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
        if(type=="family"){
            return "rgba(" + r + ", " + g + ", " + b + ", 1)";
        }
        if(type=="genes"){
            return "rgba(" + r + ", " + g + ", " + b + ", 0.6)";
        }
        if(type=="alleles"){
            return "rgba(" + r + ", " + g + ", " + b + ", 0.3)";
        }

    }

function clone(obj){
    var objClone;
    if (obj.constructor == Object){
        objClone = new obj.constructor();
    }else{
        objClone = new obj.constructor(obj.valueOf());
    }
    for(var key in obj){
        if ( objClone[key] != obj[key] ){
            if ( typeof(obj[key]) == 'object' ){
                objClone[key] = clone(obj[key]);
            }else{
                objClone[key] = obj[key];
            }
        }
    }
    return objClone;
}


$.urlParam = function(name){
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return results[1] || 0;
}


$(document).ready(function() {
    var mUrl = $.urlParam("abp_id");
    var sUrl = $.urlParam("abs_id");
    $('#project-link').attr('href','/web-app/project_detail.html?abp_id='+mUrl);
    $("#svg-div").css("overflow","hidden");
    $.urlParam = function(name){
        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return results[1] || 0;
    }
    var abs_id = $.urlParam('abs_id');

    $.get('/upload/random-ab/'+abs_id+'/', function(res){
         var html='';
         $.each(res, function(i, e){
             html+='<a href="abome_ab.html?abs_id='+abs_id+'&ab='+e+'&abp_id='+mUrl+'">ab'+i+'  </a>';
         });
         $('.random_list').html(html);
     });

    $.get('/upload/sample-ab/'+abs_id+'/', function(res){
        p_h = data_process(res['heavy']);
        render_d3_bar(p_h['v'], res['heavy']['total'], '.profile_v_h');
        render_d3_bar(p_h['d'], res['heavy']['total'], '.profile_d_h');
        render_d3_bar(p_h['j'], res['heavy']['total'], '.profile_j_h');
        light = combine_light(res['kappa'], res['lambda']);
        p_l = data_process(light);
        render_d3_bar(p_l['v'], light['total'], '.profile_v_l');
        render_d3_bar(p_l['j'], light['total'], '.profile_j_l');
    });
});

function combine_light(kappa, lambda)
{
    var light = clone(kappa);
    light.total += lambda.total;
    for(var v1 in lambda.v)
    {
        if(v1 in light)
        {
            light.v[v1]+=lambda.v[v1];
        }
        else
        {
            light.v[v1]=lambda.v[v1];
        }
    }

    for(var v1 in lambda.j)
    {
        if(v1 in light)
        {
            light.j[v1]+=lambda.j[v1];
        }
        else
        {
            light.j[v1]=lambda.j[v1];
        }
    }
    return light;
}

function downloadURL(url) {
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
};

function submit_download_form(selector, output_format)
{
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString($(selector+' svg')[0]);
    data = {
        'output_format': output_format,
        'svg': svg_xml,
    }
    $.post(
        '/upload/convert-svg/',
        data,
        function(res){
            downloadURL(res);
    })
}


function render_d3_bar(obj, total, selector)
{
    var width = 850, bar_max=700, tick = 10;
    var zoom = 1;
    var data = map_to_array(obj);

    $(selector+" #save_to_svg").click(function() { submit_download_form(selector, "svg"); });
    $(selector+" #save_to_pdf").click(function() { submit_download_form(selector, "pdf"); });
    $(selector+" #save_to_png").click(function() { submit_download_form(selector, "png"); });

    function clear_svg()
    {
        d3.select(selector+' svg')
           .selectAll("g")
             .remove();
           d3.select(selector+' svg')
           .selectAll("line")
             .remove();
    }
    $(selector).find('.refresh').click(function(){
        clear_svg();
           zoom = 1;
           data = map_to_array(obj);
        bar_render(zoom, tick);
    });

    $(selector).find('.zoom-in').click(function(){
        clear_svg();
           zoom = zoom*1.2;
        bar_render(zoom, tick);
    });

    $(selector).find('.zoom-out').click(function(){
            clear_svg();
            zoom = zoom*0.8;
            bar_render(zoom, tick);
    });
    bar_render(zoom, tick);
    $(selector+" #button-div").removeClass("hide");
    function bar_render(zoom, tick)
    {
        function to_percent(count)
        {
            return 100*count/total;
        }

        function to_percent_float(count) {
            return (100 * count / total).toFixed(2);
        }

        var barHeight = 20;
        var y_trans = 0, x_trans=108;

        var chart = d3.select(selector+' svg')
            .attr("width", width);

        var xScale = d3.scale.linear()
            .domain([0, 100/zoom])
            .range([0, bar_max]);
        var yScale = d3.scale.ordinal()
            .domain($.map(data, function (value, key) { return value.name; }))
            .rangeRoundBands([0, barHeight * data.length], 0);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(tick);
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        var bar = chart.selectAll("g")
            .data(data)
              .enter().append("g")
              .attr("transform", function(d, i) {
                  ret =  "translate("+x_trans+"," + y_trans + ")";
                y_trans += (bar_height[d.type]);
                  return ret;
              });

          chart.attr("height", y_trans+30);

        var barset = chart.append("g")
          .attr("class", "x axis")
          .call(xAxis)
          .attr("transform", function(d, i) { return "translate("+(x_trans-1)+", "+y_trans+")"; });

        var smallLine = barset.selectAll("g");
        smallLine.selectAll("line")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("shape-rendering", "crispEdges");
        smallLine.selectAll("text")
            .attr("font-size", "14px");
        barset.selectAll("path")
        .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("shape-rendering", "crispEdges");
        bar.append("rect")
            .style("fill", function(d){
                return getRGBColorFromHex(d.color, d.type);

              })
              .style("cursor", function(d, i){
                  if(d.type == "family" || d.type == "genes")
                      return "pointer";
                  return "default";
              })
             .attr("y", function(d,i) {
                return bar_gap[d.type];
           })
           .attr("width", function(d,i) {
                // if(xScale(to_percent(d.count))>width){
                    // return width-120;
                // }
                return xScale(to_percent(d.count));
           })
           .attr("height", function(d,i) {
                return bar_height[d.type]-bar_gap[d.type];
           });

          bar.append("text")
          .attr("x", function(d,i) {
                return xScale(to_percent(d.count))+5;
          })
          .attr("y", function(d,i) {
               return bar_height[d.type]/2;
          })
          .attr("dy", function(d, i){
              if(d.type=='alleles')
                return ".4em";
            if(d.type=='genes')
                return ".5em";
            return ".6em";
            })
          .style("fill", function(d){
              return bar_color[0][d.type];
             })
            .style("font-size", function(d) {
                if(d.type=='alleles')
                    return "9px";
                if(d.type=='genes')
                    return "11px";
                return "13px"; })
          .text(function(d,i) { return to_percent_float(d.count)+'%'; });

          // new code
          bar.append("text")
          .attr("x", function(d,i) {
              if(to_percent(d.count) >= 10){
                  return xScale(to_percent(d.count))+52;
              }else{
                  return xScale(to_percent(d.count))+45;
              }

          })
          .attr("y", function(d,i) {
            return bar_height[d.type]/2;
          })
          .attr("dy", function(d, i){
              if(d.type=='alleles')
                return ".44em";
            if(d.type=='genes')
                return ".54em";
            return ".64em";
            })
          .style("fill", function(d){
            return bar_color[0][d.type];
           })
          .style("font-size", function(d) {
            if(d.type=='alleles')
                return "8px";
            if(d.type=='genes')
                return "10px";
            return "12px"; })
          .text(function(d,i) { return "(" + d.count + ")"; });
          // end new code

          bar.append("text")
          .attr("x", function(d,i) {
               if(d.type=='alleles')
                    return -90;
                if(d.type=='genes')
                    return -95;
                return -100;
          })
          .attr("y", function(d,i) {
               return bar_height[d.type]/2;
          })
          .attr("dy", function(d, i){
              if(d.type=='alleles')
                return ".5em";
            if(d.type=='genes')
                return ".5em";
            return ".7em";
            })
            .style("cursor", function(d, i){
                  if(d.type == "family" || d.type == "genes")
                      return "pointer";
                  return "default";
              })
          .style("fill", function(d){
              return bar_color[0][d.type];
             })
            .style("font-size", function(d) {
                if(d.type=='alleles')
                    return "10px";
                if(d.type=='genes')
                    return "12px";
                return "15px"; })
          .text(function(d,i) { return d.name; });

          chart.append("line")
            .attr("x1", x_trans-1)
            .attr("y1", 0)
            .attr("x2", x_trans-1)
            .attr("y2", y_trans)
            .attr("stroke-width", 1)
            .attr("stroke", "black");

         bar.on("click", function(d, i) {
             if (d.type=='alleles')
                 return
            if (!d.clicked) {
                data = array_join_at(data, d.children, i);
            }else{
                data_pop_at(data, i);
            }
            d3.select(selector+' svg')
                 .selectAll("g")
                 .remove();
             d3.select(selector+' svg')
                 .selectAll("line")
                 .remove();
            bar_render(zoom, tick);
        });
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
        // res['gene'] = s.split('*')[0];
        res['gene'] = res['family'] + '-' + s.split('*')[0];
        res['allele'] = k;
    } else {
        res['family'] = k.split('*')[0];
        // res['allele'] = k.split('*')[1];
        res['allele'] = k;
    }
    return res;
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
                    new_alleles.push(g.children[alleles_items[key].index]);
                }
                g.color = i;
                g.children = new_alleles;
                g.clicked = false;
                new_genes.push(g);
            });
            origin_data[value1]['children'] = new_genes;
        }
        origin_data[value1].color = i;
        origin_data[value1].clicked = false;
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
            if ( f in tree) {
                tree[f]['count'] += v;
                if (g != null) {
                    if ( g in tree[f]['children']) {
                        tree[f]['children'][g]['count'] += v;
                        tree[f]['children'][g]['type'] = 'genes';
                        tree[f]['children'][g]['name'] = g;
                        tree[f]['children'][g]['children'].push(allele);
                    } else {
                        tree[f]['children'][g] = {
                            'count' : v,
                            'type' : 'genes',
                            'name' : g,
                            'children' : [allele]
                        };
                    }
                } else {
                    tree[f]['children'].push(allele);
                }
            } else {
                tree[f] = {
                    'count' : v,
                    'name' : f,
                    'type' : 'family'
                };
                if (g != null) {
                    tree[f]['children'] = {};
                    tree[f]['children'][g] = {
                        'count' : v,
                        'type' : 'genes',
                        'name' : g,
                        'children' : [allele]
                    };
                } else {
                    tree[f]['children'] = [allele];
                }
            }
        }
        trees[key] = tree;
    }
    return trees;
}

