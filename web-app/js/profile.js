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
var data_heavy, data_light;

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

$(document).ready(function() {
    $.urlParam = function(name){
        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return results[1] || 0;
    }
    var id = $.urlParam('id');

    $.get('/upload/random-ab/'+id, function(res){
    	 var html='';
		 $.each(res, function(i, e){
			 html+='<a href="abome_ab.html?sample='+id+'&ab='+e+'">ab'+i+'  </a>';
		 });
		 $('.random_list').html(html);
     });

    $.get('/upload/sample-ab/'+id, function(res){
    	var tmp = clone(res);
        p_l = data_process(tmp['light']);
        p_l['total'] = res['light']['total'];
        p_h = data_process(tmp['heavy']);
		p_h['total'] = res['heavy']['total'];
        data_heavy = p_h;
        data_light = p_l;
        setPlot();
    });

});

function gene_parse(k)
{
	var res = {'family':null, 'gene':null};
	var tmp = k.split('/');
	if(tmp.length ==2)
	{
		res['family'] = tmp[0];
		res['gene'] = tmp[1].split('*')[0];
		return res;
	}
	var tmp = k.split('-');
	if(tmp.length ==2)
	{
		res['family'] = tmp[0];
		res['gene'] = tmp[1].split('*')[0];
		return res;
	}
	res['family'] = k.split('*')[0];
	return res;
}

//raw --- {'total':xxxx, 'd':{}, 'j':{}, 'v':{}}
function data_process(raw)
{
	var res = {};
	var total = raw['total'];
	var trees={};
	for(var key in raw)
	{
		if (key == 'total') continue;
		res[key] = {};
		var parsed, alleles={}, tree={};
		for (var k1 in raw[key])
		{
			parsed = gene_parse(k1);
			parsed['val'] = raw[key][k1];
			alleles[k1]=parsed;
		}
		res[key]=alleles;
		for(var k2 in alleles)
		{
			var f = alleles[k2]['family'];
			var g = alleles[k2]['gene'];
			var v = alleles[k2]['val'];
			if(f in tree)
			{
				tree[f]['total'] += v;
				if(g != null)
				{
					if(g in tree[f]['genes'])
					{
						tree[f]['genes'][g] += v;
					}
					else
					{
						tree[f]['genes'][g] = v;
					}
				}
			}
			else
			{
				tree[f] = {'total':v, 'genes':{}};
				if(g != null)
				{
					tree[f]['genes'][g] = v;
				}
			}
		}
		trees[key] = tree;
		// res[key] = {};
		// res[key]['allele'] = raw[key];
		// var gene={}, family={};
		// for(var k in res[key]['allele'])
		// {
			// var val = res[key]['allele'][k];
			// var tmp = 100*val/total;
			// tmp = tmp.toFixed(2)
			// res[key]['allele'][k] = tmp+'%';
            // //split to family and gene
            // tmp = gene_parse(k);
		// }
	}

	return {'details':res,'trees':trees};
}

function setPlotAndSidebarValue(){
    var i = 1;
    $.each(v_count, function(key, value) {
        vvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        //$('.variable-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
        i++;
    });
    i = 0;
    varray.push(vvalue);
    $.each(d_count, function(key, value) {
        dvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        //$('.diversity-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
        i++;
    });
    i = 0;
    darray.push(dvalue);

    $.each(j_count, function(key, value) {
        jvalue.push(new Array(Math.log(value) * Math.LOG10E, key));
        //$('.joining-list').append('<a href="#" class="list-group-item" style="border: 0px; padding:3px 5px;">'+key+'</a>');
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

var plot_args = {
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
            barPadding : 2, //设置同一分类两个柱状条之间的距离（px）
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
}
function setPlot() {
    //横向柱状图
    var data_v_h=[];
    var heavy_total = p_h['total'];
    for(var key in p_h['trees']['v'])
    {
		var total = p_h['trees']['v'][key]['total'];
		data_v_h.push([total*100/heavy_total, key]);
    }
    profile_v_h = $.jqplot('profile-v-h', [data_v_h], plot_args);

    var data_d_h=[];
    for(var key in p_h['trees']['d'])
    {
		var total = p_h['trees']['d'][key]['total'];
		data_d_h.push([total*100/heavy_total, key]);
    }
    profile_d_h = $.jqplot('profile-d-h', [data_d_h], plot_args);

    var data_j_h=[];
    for(var key in p_h['trees']['j'])
    {
		var total = p_h['trees']['j'][key]['total'];
		data_j_h.push([total*100/heavy_total, key]);
    }
    profile_j_h = $.jqplot('profile-j-h', [data_j_h], plot_args);

    var data_v_l=[];
    var light_total = p_l['total'];
    for(var key in p_l['trees']['v'])
    {
		var total = p_l['trees']['v'][key]['total'];
		data_v_l.push([total*100/light_total, key]);
    }
    profile_v_l = $.jqplot('profile-v-l', [data_v_l], plot_args);

    var data_j_l=[];
    for(var key in p_l['trees']['j'])
    {
		var total = p_l['trees']['j'][key]['total'];
		data_j_l.push([total*100/light_total, key]);
    }
    profile_j_l = $.jqplot('profile-j-l', [data_j_l], plot_args);
}

