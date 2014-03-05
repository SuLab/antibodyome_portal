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
        // p_l = data_process(tmp['light']);
        // p_l['total'] = res['light']['total'];
        p_h = data_process(tmp['heavy']);
		p_h['total'] = res['heavy']['total'];
        data_heavy = p_h;
        // data_light = p_l;
        //setPlot();
        render_d3_bar({total:p_h['total'], 'trees':p_h['trees']['d']});
    });
});

function render_d3_bar(obj)
{
	var data = [];
	var raw = obj['trees'];
	var total = obj['total'];
	for(var key in raw)
	{
		data.push({name: key, obj:raw[key]});
	}
	bar_render();
	function bar_render()
	{
		function to_percent(count)
		{
			return parseInt(100*count/total);
		}
		function to_percent_float(count)
		{
			return (100*count/total).toFixed(2);
		}

		var width = 800,
    	barHeight = 20;
    	var x = d3.scale.linear()
    		.range([0, width]);
    	var chart = d3.select(".profile_d")
    		.attr("width", width);
		chart.attr("height", barHeight * data.length+30);

		var xScale = d3.scale.linear()
			.domain([0, 100])
			.range([0, $('.profile_d').width()]);
		var yScale = d3.scale.ordinal()
			.domain(data.map(function(d) { return d.name; }))
			.rangeRoundBands([0, barHeight * data.length], 0);

		var xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom");
		var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")

		var bar = chart.selectAll("g")
	    	.data(data)
	  		.enter().append("g")
	  		.attr("transform", function(d, i) { return "translate(70," + i * barHeight + ")"; });

	    chart.append("g")
	      .attr("class", "x axis")
	      .call(xAxis)
	      .attr("transform", function(d, i) { return "translate(69, "+barHeight*data.length+")"; });

	    chart.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	      .attr("transform", function(d, i) { return "translate(69, 0)"; });

        bar.append("rect")
	       .attr("width", function(d) {
	       	 return xScale(to_percent(d.obj.total));
	       })
	       .attr("height", barHeight - 2);
	  bar.append("text")
	      .attr("x", function(d) {
	      	return to_percent(xScale(d.obj.total)) + 20;
	      	})
	      .attr("y", barHeight / 2)
	      .attr("dy", ".35em")
	      .style("fill", "black")
	      .text(function(d) { return to_percent_float(d.obj.total)+'%'; });

	 bar.on("click", function(d, i) {
	 	if($(bar[0][i]).attr('expanded')=='true')
	 	{
	 		$(bar[0][i]).attr('expanded',false);
	 		$(bar[0][i]).append('div');
	 	}
	 	else
	 		$(bar[0][i]).attr('expanded',true);
	 });
    }
}
//remove different type data after index i
function data_pop_at(a, i)
{
	var type = a[i].type;
	var j=i+1;
	while(a[j].type != type)
	{
		j++;
	}
	a.splice(i+1, j-i-1);
}

function array_join_at(a_d, a_s, i)
{
	var a_new = new Array();
	for(var j=0; j<=i; j++)
	{
		a_new.push(a_d[j]);
	}
	a_new = a_new.concat(a_s);
	for(var j=i+1; j<a_d.length; j++)
	{
		a_new.push(a_d[j])
	}
	return a_new;
}

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
			var allele = new Object;
			allele[k2] = v;
			if(f in tree)
			{
				tree[f]['total'] += v;
				if(g != null)
				{
					if(g in tree[f]['genes'])
					{
						tree[f]['genes'][g]['total'] += v;
						tree[f]['genes'][g]['alleles'].push(allele);
					}
					else
					{
						tree[f]['genes'][g] = {'total':v, 'alleles':[allele]};
					}
				}
				else
				{
					tree[f]['alleles'].push({k2:v});
				}
			}
			else
			{
				tree[f] = {'total':v};
				if(g != null)
				{
					tree[f]['genes'] = {}
					tree[f]['genes'][g] = {'total':v, 'alleles':[allele]};
				}
				else
				{
					tree[f]['alleles'] = [allele];
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





