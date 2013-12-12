
$(document).ready(function() {
	var url=window.location.toString();
    var str="";
    var str_value="";
    var id;
    if(url.indexOf("?")!=-1){
        var ary=url.split("?")[1].split("&");
        for(var i in ary){
            str=ary[i].split("=")[0];
            if (str == "id") {
                id = decodeURI(ary[i].split("=")[1]);
                renderProjectDetail(id);
            }
        }
    }
    $('#edit-project').bind('click', function(){
    	window.location.href = 'upload.html?id='+id;
    });

    $('#analyze').click(function() {
        // var id = $('#project-form').attr('data');
        var self = $(this);
        $.ajax({
            url:"/upload/project-analysis/"+id+'/',
            type:'POST',
            data:null,
            dataType: 'application/json',
            timeout: 1000,
            success: function(res)
                {},
            error: function(res)
                {
                    if(res.status)
                    {
                        self.text("Waiting for analyzing...");
                        self.addClass('disabled');
                    }
                }});
    });

});


function renderProjectDetail(id){
    $.get(
        "/upload/project/"+id+'/',
        function(res){
            var analyze = $("#analyze");
            switch (res.status) {
                case 0:
                    analyze.text("Start analyze");
                    break;
                case 1:
                    analyze.text("Waiting for analyzing...");
                    analyze.addClass('disabled');
                    break;
                case 2:
                    analyze.text("Analyzing...");
                    analyze.addClass('disabled');
                    break;
                case 3:
                    analyze.text("Analyzed");
                    analyze.addClass('disabled');
                    break;
                case 4:
                    analyze.text("Analyze failed");
                    analyze.addClass('disabled');
            }
            $('#project-title').text(res.title);
            $('#select-permission').text(res.permission);
            $('#select-organism').text(res.organism);
            $('#platform').text(res.metadata);
            $('#keywords').text(res.slug);
            $('#summary').text(res.summary);
            var html2 = $("#sample-list-tmpl").tmpl({'samples': res.samples});
            $('#sample-list-detail').html(html2);
            $('.disabled').attr('disabled','disabled');

        });
}
