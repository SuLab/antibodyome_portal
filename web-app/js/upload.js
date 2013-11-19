$(document).ready(function() {
    $("#navbar").load("navbar.html");
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

        autoUpload : false,

        text : {
            uploadButton : '<a href="#" class="btn btn-default "> <span class="glyphicon glyphicon-plus"></span> Select Files</a>'
        },

        chunking : {
            enabled : true,
            partSize : 100 * 1024 * 1024
        },

        resume : {
            enabled : true
        },

        validation : {
            itemLimit : 5,
            sizeLimit : 2 * 1024 * 1024 * 1024
        },
    })

    $('#manual-fine-uploader').on('submit',function(id, name) {
        $(".qq-upload-list").append($("#sample-detail").html());
        $(".qq-upload-list").append('<div class="name_'+name+' hide"></div>');
        $.validate({});
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
                console.log(res);
                if(res.status) {
                    $('#project-form').attr('data', res.project_id);
                    $('#manual-fine-uploader').fineUploaderS3('uploadStoredFiles');
                }
        });
    });

    $('#manual-fine-uploader').on('cancel',function(id, name) {
        var name_div = $('.qq-upload-list').find('.name_'+name);
        name_div.prev().remove();
        name_div.remove();
    });

    $('#manual-fine-uploader').on('complete', function(id, name){
        // var sample_list = []
        // $('.qq-uploader .sample-form').each(function(){
        //     var name = $(this).find("#sample-name").val();
        //     var description = $(this).find("#sample-description").val();
        //     var filename = $(this).next().next().find('.qq-upload-file').text();
        //     sample_dict = {'name': name, 'description': description, 'filename': filename};
        //     sample_list.push(sample_dict);
        // });
        // var data = {
        //     'title': title,
        //     'organism': organism,
        //     'metadata': metadata,
        //     'slug': slug,
        //     'summary': summary,
        //     'sample_list': sample_list,
        // }
        var name_div = $('.qq-upload-list .name_'+name);
        var name = name_div.prev().find("#sample-name").val();
        var description = name_div.prev().find("#sample-description").val();
        var filename = name_div.next().find('.qq-upload-file').text();
        var id = $('#project-form').attr('data');
        var data = {
            'name': name,
            'description': description,
            'filename': filename,
        }

        data_json = JSON.stringify(data);
        $.post(
            "/upload/create-sample/"+id,
            data_json,
            function(res){
                console.log(res);
        });
    });

    $('#addsample').click(function() {
        $("#sample").toggle(500, function() {
            if ($("#sample").css("display") == "block") {
                $('#addsample').text("Cancel add samples");
            } else {
                $('#addsample').text("Add samples");
            }
        });
    });


});
