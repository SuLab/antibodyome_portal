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
var data_heavy, data_light, total;

var bar_color = [{'family':"rgba(0, 0, 0, 1.0)",'genes':"rgba(0, 0, 0, 0.5)",'alleles':"rgba(0, 0, 0, 0.3)"}, {'family':"rgba(0, 0, 0, 1.0)",'genes':"rgba(0, 0, 0, 0.5)",'alleles':"rgba(0, 0, 0, 0.3)"}]
var bar_height = {'family':18, 'genes':12, 'alleles':10}
var bar_gap = {'family':4, 'genes':2, 'alleles':1}

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
    $("#svg-div").css("overflow","hidden");
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
        p_h = data_process(tmp['heavy']);
        render_d3_bar(p_h);
    });
});

function render_d3_bar(obj)
{
	var width = 800, tick = 10
	var data = map_to_array(obj);

	$('.refresh').click(function(){
		d3.select(".profile_d")
	 	  .selectAll("g")
	   	  .remove();
	   	width = 800;
	   	tick = 10;
		bar_render(width, tick);
	})

	$('.zoom-in').click(function(){
		d3.select(".profile_d")
	 	  .selectAll("g")
	   	  .remove();
	   	width = width *1.2;
	   	tick = tick*1.2;
		bar_render(width, tick);
	})

	$('.zoom-out').click(function(){
        if (width > 370.5){
            d3.select(".profile_d")
                .selectAll("g")
                .remove();
            width = width *0.8;
            tick = tick*0.8;
            bar_render(width, tick*0.8);
        }
	})
	bar_render(width, tick);
	function bar_render(width, tick)
	{
		function to_percent(count)
		{
			return parseInt(100*count/total);
		}
		function to_percent_float(count)
		{
			return (100*count/total).toFixed(2);
		}

		var barHeight = 20;
		var y_trans = 0;

    	var chart = d3.select(".profile_d")
    		.attr("width", width)

 		chart.attr("height", barHeight * data.length+30);

		var xScale = d3.scale.linear()
			.domain([0, 100])
			.range([0, $('.profile_d').width()-250]);
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
	  			ret =  "translate(108," + y_trans + ")";
				y_trans += (bar_height[d.type]);
	  			return ret;
	  		});

	    chart.append("g")
	      .attr("class", "x axis")
	      .call(xAxis)
	      .attr("transform", function(d, i) { return "translate(107, "+y_trans+")"; });

        bar.append("rect")
        	.style("fill", function(d){
  				return bar_color[d.color][d.type];
  			})
  		   .attr("y", function(d,i) {
	       	 return bar_gap[d.type];
	       })
	       .attr("width", function(d,i) {
	       	 return xScale(to_percent(d.count))
	       })
	       .attr("height", function(d,i) {
	       	 return bar_height[d.type]-bar_gap[d.type];
	       });

	  	bar.append("text")
	      .attr("x", function(d,i) {
	       	return xScale(to_percent(d.count)+1);
	      })
	      .attr("y", function(d,i) {
	       	return bar_height[d.type]/2;
	      })
	      .attr("dy", ".35em")
	      .style("fill", function(d){
	      	return bar_color[d.color][d.type];
  		   })
  		  .style("font-size", function(d) {
  		  	if(d.type=='alleles')
  		  		return "10px";
  		  	if(d.type=='gene')
  		  		return "12px";
  		  	return "15px"; })
	      .text(function(d,i) { return to_percent_float(d.count)+'%'; });

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
	      .attr("dy", ".35em")
	      .style("fill", function(d){
	      	return bar_color[d.color][d.type];
  		   })
  		  .style("font-size", function(d) {
  		  	if(d.type=='alleles')
  		  		return "10px";
  		  	if(d.type=='genes')
  		  		return "12px";
  		  	return "15px"; })
	      .text(function(d,i) { return d.name; });

          chart.append("line")
            .attr("x1", 107)
            .attr("y1", 0)
            .attr("x2", 107)
            .attr("y2", y_trans)
            .attr("stroke-width", 1)
            .attr("stroke", "black");

		 bar.on("click", function(d, i) {
		 	if (d.type=='alleles')
		 		return;
		 	if (i<data.length-1 && data[i+1].type != d.type)
			{
				data_pop_at(data, i);
			}
			else
			{
				data = array_join_at(data, d.children, i);
			}
			d3.select(".profile_d")
	 			.selectAll("g")
	 			.remove();
	 		d3.select(".profile_d")
	 			.selectAll("line")
	 			.remove();
			bar_render(width, tick);
		 });
	 }
}
//remove different type data after index i
function data_pop_at(a, i)
{
	var type = a[i].type;
	var j=i+1;
	while((j<a.length)&&(a[j].type!=type))
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

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function gene_parse(k)
{
	var res = {'family':null, 'gene':null, 'allele':null};
	var t,s;
	t=k.indexOf('-');
	if(t == -1)
	{
		t=k.indexOf('/');
	}
	if(t != -1)
	{
		s = k.substring(t+1,k.length);
		res['family'] = k.substring(0, t);
		// res['gene'] = s.split('*')[0];
		res['gene'] = res['family']+'-'+s.split('*')[0];
		res['allele'] = k;
	}
	else
	{
		res['family'] = k.split('*')[0];
		// res['allele'] = k.split('*')[1];
		res['allele'] = k;
	}
	return res;
}

function map_to_array(origin_data)
{
	var new_data = [];
	var new_genes = [];
	var i=0;
	for (var key in origin_data) {
		var new_genes = [];
		for(var gene_key in origin_data[key].children) {
			var g = origin_data[key].children[gene_key];
			for(var j in g['children'])
			{
				g['children'][j].color = i;
			}
			g.color = i;
			new_genes.push(origin_data[key].children[gene_key]);
		}
		origin_data[key]['children'] = new_genes;
		origin_data[key].color = i;
		new_data.push(origin_data[key]);
		if(i==0) i=1; else i=0;
	}
	return new_data;
}


//raw --- {'total':xxxx, 'd':{}, 'j':{}, 'v':{}}
function data_process(raw)
{
	var res = {};
	total = raw['total'];
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
			allele['name'] = alleles[k2]['allele'];
			allele['count'] = v;
			allele['type'] = 'alleles';
			if(f in tree)
			{
				tree[f]['count'] += v;
				if(g != null)
				{
					if(g in tree[f]['children'])
					{
						tree[f]['children'][g]['count'] += v;
						tree[f]['children'][g]['type'] = 'genes';
						tree[f]['children'][g]['name'] = g;
						tree[f]['children'][g]['children'].push(allele);
					}
					else
					{
						tree[f]['children'][g] = {'count':v, 'type':'genes','name': g,'children':[allele]};
					}
				}
				else
				{
					tree[f]['children'].push(allele)
				}
			}
			else
			{
				tree[f] = {'count':v, 'name':f, 'type':'family'};
				if(g != null)
				{
					tree[f]['children'] = {}
					tree[f]['children'][g] = {'count':v,'type':'genes','name': g, 'children':[allele]};
				}
				else
				{
					tree[f]['children'] = [allele];
				}
			}
		}
	}
	return tree;
}





