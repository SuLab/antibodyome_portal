var page=1;

$(document).ready(function() {
	renderProjectList(page);

    $('#manual-fine-uploader').fineUploaderS3({
        request : {
            endpoint : "abome-test.s3.amazonaws.com",
            accessKey : "AKIAIMPLN6YTZVD5Q3TA"
        },
        signature : {
            endpoint : "/upload/sign-policy"
        },
        retry : {
            showButton : true
        },
        // autoUpload : false,
        text : {
            uploadButton : '<a href="#" class="btn btn-default "> <span class="glyphicon glyphicon-plus"></span>samples</a>'
        },
        chunking : {
            enabled : true,
            partSize : 10 * 1024 * 1024
        },
        resume : {
            enabled : true
        },
        deleteFile: {
            enabled: true,
            endpoint: "/upload/delete-file"
        },
        validation : {
            itemLimit : 5,
            sizeLimit : 2 * 1024 * 1024 * 1024
        },
    })
    $('.qq-upload-button').css('border-bottom','none');
    $('.qq-progress-bar').css('height','5px');
    $('#manual-fine-uploader').on('submitted',function(id, name) {
        console.log(name)
        $(".qq-upload-list li").last().append($("#sample-detail").html());
        $(".qq-upload-list li").last().append('<div class="sample-name-div name_'+name+' hide"></div>');

        if(name%2) {
            $(".qq-upload-list li").last().css('background','#eee');
        }
        $.validate({});

        $('.delete-sample').click(function(){
            $(this).closest('li').remove();
        });

        var name_div = $('.qq-upload-list .name_'+name);
        var progress_bar = name_div.closest("li").find(".qq-progress-bar");
        // progress_bar.removeClass("qq-progress-bar");
        // progress_bar.addClass('progress_bar');
        progress_bar.wrap('<div class="progress progress-striped active"></div>')
    });

    $.validate({});

    $('#triggerUpload').click(function() {
        var title = $("#project-form #project-title").val();
        var organism = $("#project-form #select").val();
        var metadata = $("#project-form #platform").val();
        var slug = $("#project-form #keywords").val();
        var summary = $("#project-form #summary").val();
        var data = {
            'title': title,
            'organism': organism,
            'metadata': metadata,
            'slug': slug,
            'summary': summary,
        }
        data_json = JSON.stringify(data);
        $.post(
            "/upload/create-project",
            data_json,
            function(res){
                if(res.status) {
                    $('#project-form').attr('data', res.project_id);
                    name_list = []
                    description_list = []
                    filename_list = []
                    sample_list = []
                    $('.qq-upload-list .sample-form').each(function(){
                        var name = $(this).find('#sample-name').val();
                        var description = $(this).find('#sample-description').val();
                        var filename = $(this).closest('li').find('.qq-upload-file').text();
                        // name_list.push(name);
                        // description_list.push(description);
                        // filename_list.push(filename);
                        sample_list.push(
                            {
                                'name': name,
                                'description': description,
                                'filename': filename
                            }
                        )
                    });

                    var id = res.project_id;
                    // var data = {
                    //     'sample_list': sample_list,
                    //     'id': id
                    // }
                    console.log(data)
                    data_json = JSON.stringify(sample_list);
                    $.post(
                        "/upload/create-sample/"+id,
                        data_json,
                        function(res){
                            console.log(res);
                            $('#triggerUpload').attr('disabled','disabled');
                            $('#start-analysis').removeClass('hide');
                    });
                }
        });
        // $('#manual-fine-uploader').fineUploaderS3('uploadStoredFiles');
    });


    $('#start-analysis').click(function() {
        var id = $('#project-form').attr('data');
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
	                    var html = $("#project-tmpl").tmpl({'projects': res.projects});
	                    $('.edit-project').addClass('hide');
	                    $('#project-container').html(html);
	                }
	            }});
    });


    $('#manual-fine-uploader').on('complete', function(id, name){
        var name_div = $('.qq-upload-list .name_'+name);
        var completed = true;
        name_div.closest('li').find('.progress.progress-striped.active').addClass('hide');
        name_div.closest('li').removeClass('qq-upload-success');
        name_div.addClass('completed');
        $('.qq-upload-list').find('.sample-name-div').each(function(){
            if(!$(this).hasClass('completed')) {
                completed = false;
                return;

            }
        })
        if(completed) {
            $('.submit-btn').removeClass('disabled');
        }
    });


    $('.add-project').click(function(){
        window.location.reload();
    });

});



function renderProjectList(page){
	$.get(
	"/upload/project-list/?page="+page,
	function(res){
	    var html = $("#project-list-tmpl").tmpl({'projects': res.detail});
	    $('#project-list').html(html);
	    if(res.prev == true)
	    {
	    	$('.project_prev').css('display', 'block');
	    	$('.project_prev').click(function(){renderProjectList(page-1);});
	    }
	    if(res.next == true)
	    {
	    	$('.project_next').css('display', 'block');
	    	$('.project_next').click(function(){renderProjectList(page+1);});
	    }
    });
}


function renderProjectDetail(obj){
    var id = $(obj).attr('id')
    console.log(id)
    $.get(
        "/upload/project/"+id+'/',
        function(res){
            console.log(res.metadata)
            $('.project-hint').html('<i class="icon-align-left"></i> Detail');
            $('#project-title').val(res.title);
            $('.project-select').val(res.organism);
            $('#platform').val(res.metadata);
            $('#keywords').val(res.slug);
            $('#summary').val(res.summary);
            var html2 = $("#sample-list-tmpl").tmpl({'samples': res.samples});
            $('#sample-list-detail').html(html2);
            $('.disabled').attr('disabled','disabled');
        });
}
