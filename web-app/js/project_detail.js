
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
});


function renderProjectDetail(id){
    // var id = $(obj).attr('id')
    // console.log(id)
    $.get(
        "/upload/project/"+id+'/',
        function(res){
            console.log(res.metadata)
            $('#project-title').val(res.title);
            $('#select-permission').val(res.permission);
            $('#select-organism').val(res.organism);
            $('#platform').val(res.metadata);
            $('#keywords').val(res.slug);
            $('#summary').val(res.summary);
            var html2 = $("#sample-list-tmpl").tmpl({'samples': res.samples});
            $('#sample-list-detail').html(html2);
            $('.disabled').attr('disabled','disabled');
        });
}
