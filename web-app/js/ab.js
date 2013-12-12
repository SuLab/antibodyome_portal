var template = (["", '<div class="container">', '<div class="jumbotron">', '<h1>Antibody</h1>', '<h5> _id: {{_id}}</h5>', '<h5> seq_id: {{seq_id}}</h5>', '<h5> prod: {{prod}}</h5>', '<h5> chain: {{chain}}</h5>', '<h5> nr_seq: {{nr_seq}}</h5>', "</div>", "</div>", '<div class="container">', '<h2>Gene</h2>', '<table class="table table-striped" table-bordered>', "<thead>", '<tr>', '<th></th><th>variable</th><th>diversity</th><th>joining</th>', '</tr>', "</thead>", '<tbody>', '<tr>', '<td>gene</td><td>{{v_gene.full}}</td><td>{{d_gene.full}}</td><td>{{j_gene.full}}</td>', '</tr>', '<tr>', '{{#nt_identity}}', '<td>nt_identity</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>', '{{/nt_identity}}', '</tr>', '<tr>', '{{#aa_identity}}', '<td>aa_identity</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>', '{{/aa_identity}}', '</tr>', '<tr>', '{{#bitscores}}', '<td>bitscores</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>', '{{/bitscores}}', '</tr>', '<tr>', '{{#e_values}}', '<td>e_values</td><td>{{v}}</td><td>{{d}}</td><td>{{j}}</td>', '{{/e_values}}', '</tr>', '</tbody>', "</table>", '<h2>Sequences</h2>', '<div class="panel panel-default">', '<div class="panel-heading">CDR - Complementarity Determining Region</div>', '<div class="panel-body">', '<h5>cdr1:</h5>', '<div><b>aa:</b> {{cdr1_aa}}</div>', '<div><b>nt:</b> {{cdr1_nt}}</div>', '<h5>cdr2:</h5>', '<div><b>aa:</b> {{cdr2_aa}}</div>', '<div><b>nt:</b> {{cdr2_nt}}</div>', '<h5>cdr3:</h5>', '<div><b>aa:</b> {{cdr3_aa}}</div>', '<div><b>length:</b> {{cdr3_len}}</div>', '</div>', '</div>', '<div class="panel panel-default">', '<div class="panel-heading">Framework Region</div>', '<div class="panel-body">', '<h5>fr1:</h5>', '<div><b>aa:</b> {{fr1_aa}}</div>', '<div><b>nt:</b> {{fr1_nt}}</div>', '<h5>fr2:</h5>', '<div><b>aa:</b> {{fr2_aa}}</div>', '<div><b>nt:</b> {{fr2_nt}}</div>', '<h5>fr3:</h5>', '<div><b>aa:</b> {{fr3_aa}}</div>', '<div><b>len:</b> {{fr3_len}}</div>', '</div>', '</div>', '<div class="panel panel-default">', '<div class="panel-heading">Junction</div>', '<div class="panel-body">', '<div><b>aa:</b> {{junc_aa}}</div>', '<div><b>nt:</b> {{junc_nt}}</div>', '<div><b>length:</b> {{junc_len}}</div>', '</div>', '</div>', '<div class="panel panel-default">', '<div class="panel-heading">vdj:</div>', '<div class="panel-body">', '<div><b>aa:</b> {{vdj_aa}}</div>', '<div><b>nt:</b> {{vdj_nt}}</div>', '</div>', '</div>', '<h2>Mutations</h2>', '<div class="panel panel-info">', '<div class="panel-heading">join_muts_nt</div>', '<div class="panel-body">', '{{#join_muts_nt}}', '{{loc}}:{{mut}},', '{{/join_muts_nt}}', '</div>', '</div>', '<div class="panel panel-info">', '<div class="panel-heading">v_muts_aa</div>', '<div class="panel-body">', '{{#v_muts_aa}}', '{{loc}}:{{mut}},', '{{/v_muts_aa}}', '</div>', '</div>', '<div class="panel panel-info">', '<div class="panel-heading">var_muts_nt</div>', '<div class="panel-body">', '{{#var_muts_nt}}', '{{loc}}:{{mut}},', '{{/var_muts_nt}}', '</div>', '</div>', '<div class="panel panel-info">', '<div class="panel-heading">v_region_muts_nt</div>', '<div class="panel-body">', '<p>', '<b>cdr1:</b>', '{{#v_region_muts_nt.cdr1.muts}}', '{{loc}}:{{mut}},', '{{/v_region_muts_nt.cdr1.muts}}', '</p>', '<p>', '<b>cdr2:</b>', '{{#v_region_muts_nt.cdr2.muts}}', '{{loc}}:{{mut}},', '{{/v_region_muts_nt.cdr2.muts}}', '</p>', '<p>', '<b>fr1:</b>', '{{#v_region_muts_nt.fr1.muts}}', '{{loc}}:{{mut}},', '{{/v_region_muts_nt.fr1.muts}}', '</p>', '<p>', '<b>fr2:</b>', '{{#v_region_muts_nt.fr2.muts}}', '{{loc}}:{{mut}},', '{{/v_region_muts_nt.fr2.muts}}', '</p>', '<p>', '<b>fr3:</b>', '{{#v_region_muts_nt.fr3.muts}}', '{{loc}}:{{mut}},', '{{/v_region_muts_nt.fr3.muts}}', '</p>', '</div>', '</div>', "<hr />", '<footer>', '<p>', '&copy; Company 2013', "</p>", "</footer>", '</div>', ""]).join('\n');

$(document).ready(function() {
    $("#navbar").load("navbar.html");
    $('.antibody_container').html(Mustache.to_html(template, data));
});

var data = {
    "_id" : "516ce23cbc6b69b87a0c774a",
    "aa_identity" : {
        "j" : 86.67,
        "v" : 87.21
    },
    "bitscores" : {
        "j" : 69.9,
        "d" : 12.4,
        "v" : 353
    },
    "cdr1_aa" : "GDSVSIKSGG",
    "cdr1_nt" : "GGGGACAGTGTCTCTATCAAAAGTGGTGGT",
    "cdr2_aa" : "TYYTSEWIK",
    "cdr2_nt" : "ACATACTACACGTCTGAGTGGATTAAG",
    "cdr3_aa" : "ARGWVRSYFDF",
    "cdr3_len" : 11,
    "chain" : "heavy",
    "d_gene" : {
        "all" : "01",
        "gene" : "23",
        "full" : "IGHD4-23*01",
        "fam" : "4"
    },
    "e_values" : {
        "j" : 4e-16,
        "d" : 33,
        "v" : 1e-99
    },
    "fr1_aa" : "SQTLSLTCDIS",
    "fr1_nt" : "TCGCAGACCCTCTCACTCACCTGTGACATCTCC",
    "fr2_aa" : "WNWIRQSPSRGVEWLGR",
    "fr2_nt" : "TGGAACTGGATCAGGCAGTCCCCATCGAGAGGCGTTGAGTGGCTGGGAAGG",
    "fr3_aa" : "DYAVSVKSRISINPDTSKNQFSLQLNSVTPEDTAVYYC",
    "fr3_nt" : "GATTATGCAGTATCTGTGAAGAGTCGAATAAGCATCAACCCAGACACATCCAAGAACCAGTTCTCCCTGCAATTGAATTCTGTGACTCCCGAGGACACGGCTGTGTATTACTGT",
    "j_gene" : {
        "all" : "02",
        "full" : "IGHJ4*02",
        "gene" : "4"
    },
    "join_muts_nt" : [{
        "loc" : "329",
        "mut" : "A>T"
    }, {
        "loc" : "344",
        "mut" : "C>T"
    }, {
        "loc" : "345",
        "mut" : "C>A"
    }],
    "junc_aa" : "CARGWVRSYFDFW",
    "junc_len" : 13,
    "junc_nt" : "GCAAGGGGTTGGGTACGGTCCTACT",
    "nr_seq" : false,
    "nt_identity" : {
        "j" : 93.6,
        "d" : 100,
        "v" : 93.5
    },
    "prod" : "no",
    "seq_id" : "M00238:16:000000000-A3EY0:1:1101:15814:1445:1",
    "v_gene" : {
        "all" : "01",
        "gene" : "1",
        "full" : "IGHV6-1*01",
        "fam" : "6"
    },
    "v_muts_aa" : [{
        "loc" : 23,
        "mut" : "A>D"
    }, {
        "loc" : 31,
        "mut" : "S>I"
    }, {
        "loc" : 32,
        "mut" : "N>K"
    }, {
        "loc" : 34,
        "mut" : "A>G"
    }, {
        "loc" : 35,
        "mut" : "A>G"
    }, {
        "loc" : 47,
        "mut" : "L>V"
    }, {
        "loc" : 56,
        "mut" : "R>T"
    }, {
        "loc" : 58,
        "mut" : "K>E"
    }, {
        "loc" : 60,
        "mut" : "Y>I"
    }, {
        "loc" : 61,
        "mut" : "N>K"
    }, {
        "loc" : 72,
        "mut" : "T>S"
    }],
    "v_region_len" : {
        "fr3" : 38,
        "fr2" : 17,
        "fr1" : 11,
        "cdr1" : 10,
        "cdr2" : 9
    },
    "v_region_muts_nt" : {
        "fr3" : {
            "muts" : [{
                "loc" : 204,
                "mut" : "A>G"
            }, {
                "loc" : 215,
                "mut" : "C>G"
            }, {
                "loc" : 255,
                "mut" : "G>A"
            }, {
                "loc" : 256,
                "mut" : "C>T"
            }, {
                "loc" : 261,
                "mut" : "C>T"
            }],
            "num" : 5
        },
        "fr2" : {
            "muts" : [{
                "loc" : 139,
                "mut" : "C>G"
            }],
            "num" : 1
        },
        "fr1" : {
            "muts" : [{
                "loc" : 68,
                "mut" : "C>A"
            }],
            "num" : 1
        },
        "cdr1" : {
            "muts" : [{
                "loc" : 92,
                "mut" : "G>T"
            }, {
                "loc" : 96,
                "mut" : "C>A"
            }, {
                "loc" : 101,
                "mut" : "C>G"
            }, {
                "loc" : 104,
                "mut" : "C>G"
            }],
            "num" : 4
        },
        "cdr2" : {
            "muts" : [{
                "loc" : 167,
                "mut" : "G>C"
            }, {
                "loc" : 171,
                "mut" : "C>T"
            }, {
                "loc" : 172,
                "mut" : "A>G"
            }, {
                "loc" : 178,
                "mut" : "T>A"
            }, {
                "loc" : 179,
                "mut" : "A>T"
            }, {
                "loc" : 183,
                "mut" : "T>G"
            }],
            "num" : 6
        }
    },
    "var_muts_nt" : [{
        "loc" : "68",
        "mut" : "C>A"
    }, {
        "loc" : "92",
        "mut" : "G>T"
    }, {
        "loc" : "96",
        "mut" : "C>A"
    }, {
        "loc" : "101",
        "mut" : "C>G"
    }, {
        "loc" : "104",
        "mut" : "C>G"
    }, {
        "loc" : "139",
        "mut" : "C>G"
    }, {
        "loc" : "167",
        "mut" : "G>C"
    }, {
        "loc" : "171",
        "mut" : "C>T"
    }, {
        "loc" : "172",
        "mut" : "A>G"
    }, {
        "loc" : "178",
        "mut" : "T>A"
    }, {
        "loc" : "179",
        "mut" : "A>T"
    }, {
        "loc" : "183",
        "mut" : "T>G"
    }, {
        "loc" : "204",
        "mut" : "A>G"
    }, {
        "loc" : "215",
        "mut" : "C>G"
    }, {
        "loc" : "255",
        "mut" : "G>A"
    }, {
        "loc" : "256",
        "mut" : "C>T"
    }, {
        "loc" : "261",
        "mut" : "C>T"
    }],
    "vdj_aa" : "SQTLSLTCDISGDSVSIKSGGWNWIRQSPSRGVEWLGRTYYTSEWIKDYAVSVKSRISINPDTSKNQFSLQLNSVTPEDTAVYYCARGWVRSYFDFWGQGILVTVSS",
    "vdj_nt" : "TCGCAGACCCTCTCACTCACCTGTGACATCTCCGGGGACAGTGTCTCTATCAAAAGTGGTGGTTGGAACTGGATCAGGCAGTCCCCATCGAGAGGCGTTGAGTGGCTGGGAAGGACATACTACACGTCTGAGTGGATTAAGGATTATGCAGTATCTGTGAAGAGTCGAATAAGCATCAACCCAGACACATCCAAGAACCAGTTCTCCCTGCAATTGAATTCTGTGACTCCCGAGGACACGGCTGTGTATTACTGTGCAAGGGGTTGGGTACGGTCCTACTTTGACTTCTGGGGCCAGGGAATACTGGTCACCGTCTCCTCAG"
}; 