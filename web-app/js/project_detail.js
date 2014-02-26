
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
    	window.location.href = 'project_edit.html?id='+id;
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
                    $('#notification-modal').modal('show');
                    self.text("Waiting for analyzing...");
                    self.addClass('disabled');
                    $('#notification-modal #cancel_modal').click(function(event) {
                        /* Act on the event */
                        $('#notification-modal').modal('hide');
                    });
                }
            }
        });
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
            if (res.user!=res.owner) {
                $("#edit-project").hide();
            }
            $('#notification').attr('href', 'project_detail.html?id='+id)
            $('#project-title').text(res.title);
            if(typeof(res.metadata)=='string')
            {
            	meta = JSON.parse(res.metadata);
            }
            else
            {
            	meta = res.metadata;
            }
            var p_name = (res.permission==0? 'public':'private');
            $('#select-permission').text(p_name);
            $('#select-organism').text(res.organism);
            $('#platform').text(meta['platform']);
            $('#keywords').text(meta['keywords']);
            $('#summary').text(res.summary);
            var html2 = $("#sample-list-tmpl").tmpl({'samples': res.samples});
            $('#samples').html(html2);
            $('.disabled').attr('disabled','disabled');
            // console.log(res.samples)
            $('.sample-detail #view-report').click(function(){
                var id = $(this).closest('.sample-detail').attr('id');
                window.location.href = '/web-app/profile.html?id='+id;
            });

            $('.sample-detail').each(function(){
                if($(this).attr('data')!=3) {
                    $(this).find('#view-report').addClass('disabled');
                }
            })
        });
}
