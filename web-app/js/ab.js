var ab_template = (["",
'<div class="container">',
'<div class="jumbotron">',
    '<h1>Antibody</h1>',
    '<h5> _id: {{_id}}</h5>',
    '<h5> seq_id: {{seq_id}}</h5>',
    '<h5> prod: {{prod}}</h5>',
    '<h5> chain: {{chain}}</h5>',

"</div>",

'<h2>Gene</h2>',
'<table class="table table-striped" table-bordered>',
"<thead>",
'<tr>',
'<th></th><th>variable</th><th>diversity</th><th>joining</th>',
'</tr>',
"</thead>",

'<tbody>',
'<tr>',
'<td>gene</td><td>{{v_gene.full}}</td><td>{{d_gene.full}}</td><td>{{j_gene.full}}</td>',
'</tr>',

'<tr>',
'{{#nt_identity}}',
'<td>nt_identity</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>',
'{{/nt_identity}}',
'</tr>',

'<tr>',
'{{#aa_identity}}',
'<td>aa_identity</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>',
'{{/aa_identity}}',
'</tr>',

'<tr>',
'{{#bitscores}}',
'<td>bitscores</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>',
'{{/bitscores}}',
'</tr>',

'<tr>',
'{{#e_values}}',
'<td>e_values</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>',
'{{/e_values}}',
'</tr>',


'</tbody>',
"</table>",

'<h2>Alignment</h2>',
"<pre>",
"{{alignment}}",
"</pre>",

    '<h2>Sequences</h2>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">CDR - Complementarity Determining Region</div>',
    '<div class="panel-body">',
    '<h5>cdr1:</h5>',
    '<div><b>aa:</b> {{cdr1_aa}}</div>',
    '<div><b>nt:</b> {{cdr1_nt}}</div>',
    '<h5>cdr2:</h5>',
    '<div><b>aa:</b> {{cdr2_aa}}</div>',
    '<div><b>nt:</b> {{cdr2_nt}}</div>',
    '<h5>cdr3:</h5>',
    '<div><b>aa:</b> {{cdr3_aa}}</div>',
    '<div><b>length:</b> {{cdr3_len}}</div>',
    '</div>',
    '</div>',


    '<div class="panel panel-default">',
    '<div class="panel-heading">Framework Region</div>',
    '<div class="panel-body">',
    '<h5>fr1:</h5>',
    '<div><b>aa:</b> {{fr1_aa}}</div>',
    '<div><b>nt:</b> {{fr1_nt}}</div>',
    '<h5>fr2:</h5>',
    '<div><b>aa:</b> {{fr2_aa}}</div>',
    '<div><b>nt:</b> {{fr2_nt}}</div>',
    '<h5>fr3:</h5>',
    '<div><b>aa:</b> {{fr3_aa}}</div>',
    '<div><b>len:</b> {{fr3_len}}</div>',
    '</div>',
    '</div>',



    '<div class="panel panel-default">',
    '<div class="panel-heading">Junction</div>',
    '<div class="panel-body">',
    '<div><b>aa:</b> {{junc_aa}}</div>',
    '<div><b>nt:</b> {{junc_nt}}</div>',
    '<div><b>length:</b> {{junc_len}}</div>',
    '</div>',
    '</div>',

    '<div class="panel panel-default">',
    '<div class="panel-heading">vdj:</div>',
    '<div class="panel-body">',
    '<div><b>aa:</b> {{vdj_aa}}</div>',
    '<div><b>nt:</b> {{vdj_nt}}</div>',
    '</div>',
    '</div>',



    '<h2>Mutations</h2>',
    '<div class="panel panel-info">',
    '<div class="panel-heading">join_muts_nt</div>',
    '<div class="panel-body">',
    '{{#join_muts_nt}}',
      '{{loc}}:{{mut}},',
    '{{/join_muts_nt}}',
    '</div>',
    '</div>',

    '<div class="panel panel-info">',
    '<div class="panel-heading">v_muts_aa</div>',
    '<div class="panel-body">',
    '{{#v_muts_aa}}',
      '{{loc}}:{{mut}},',
    '{{/v_muts_aa}}',
    '</div>',
    '</div>',

    '<div class="panel panel-info">',
    '<div class="panel-heading">var_muts_nt</div>',
    '<div class="panel-body">',
    '{{#var_muts_nt}}',
      '{{loc}}:{{mut}},',
    '{{/var_muts_nt}}',
    '</div>',
    '</div>',

    '<div class="panel panel-info">',
    '<div class="panel-heading">v_region_muts_nt</div>',
    '<div class="panel-body">',
    '<p>',
    '<b>cdr1:</b>',
    '{{#v_region_muts_nt.cdr1.muts}}',
      '{{loc}}:{{mut}},',
    '{{/v_region_muts_nt.cdr1.muts}}',
    '</p>',
    '<p>',
    '<b>cdr2:</b>',
    '{{#v_region_muts_nt.cdr2.muts}}',
      '{{loc}}:{{mut}},',
    '{{/v_region_muts_nt.cdr2.muts}}',
    '</p>',
    '<p>',
    '<b>fr1:</b>',
    '{{#v_region_muts_nt.fr1.muts}}',
      '{{loc}}:{{mut}},',
    '{{/v_region_muts_nt.fr1.muts}}',
    '</p>',
    '<p>',
    '<b>fr2:</b>',
    '{{#v_region_muts_nt.fr2.muts}}',
      '{{loc}}:{{mut}},',
    '{{/v_region_muts_nt.fr2.muts}}',
    '</p>',
    '<p>',
    '<b>fr3:</b>',
    '{{#v_region_muts_nt.fr3.muts}}',
      '{{loc}}:{{mut}},',
    '{{/v_region_muts_nt.fr3.muts}}',
    '</p>',

    '</div>',
    '</div>',

"<hr />",
'<footer>',
'<p>',
'&copy; Company 2013',
"</p>",
"</footer>",
'</div>',

""]).join('\n');


$(document).ready(function() {
    $.urlParam = function(name){
	    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
	    return results[1] || 0;
    }
    $("#navbar").load("navbar.html");
    var sample = $.urlParam('sample');
    var ab = $.urlParam('ab');
    $.get('/upload/ab-detail/',
    	{
			'sample':sample,
			'ab':ab
    	},
	    function(res){
	    	res['join_muts_nt'] = res['join_muts_nt']['muts'];
	    	res['v_muts_aa'] = res['v_muts_aa']['muts'];
			res['var_muts_nt'] = res['var_muts_nt']['muts'];
	    	$('.antibody_container').html(Mustache.to_html(ab_template, res));
	    }
	);

});

