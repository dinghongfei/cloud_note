function showNotebooksAction(){
		console.log('1');
		var url = 'notebook/list.do';
		if(!model.notebooks){
			model.pageNum = 0;
		} else {
			model.pageNum++;
		}
		var param = {'userId':getCookie('userId'),'pageNum':model.pageNum};
		$.getJSON(url,param,function(result){
			if(result.state==SUCCESS){
				var notebooks = result.data;
				model.updateNotebookView(notebooks);
			}
			
		});
}

//模型中的更新视图方法, 当收到笔记本数据时候更新界面的显示内容
model.updateNotebookView= function(notebooks){
	if(!this.notebooks){
		//this就是当前对象，就是model
		this.notebooks = notebooks;
	} else {
		this.notebooks = this.notebooks.concat(notebooks);
	}
	var ul = $('#notebook').empty();
	var template = '<li class="online">'+
						'<a><i class="fa fa-book" title="online" rel="tooltip-bottom"/>'+
						'</i>notebook.name'+
						'<button type="button" class="btn btn-default btn-xs btn_position btn_slide_down">'+
						'<i class="fa fa-times"></i></button></a>'+
				    '</li>';
	for(var i=0;i<this.notebooks.length;i++){
		var notebook = this.notebooks[i];
		var li = $(template.replace('notebook.name',notebook.name));
		//每一个li绑定一个位置信息，用于‘点击笔记本显示笔记功能’
		li.data('index',i);
		ul.append(li);
	}
	var li='<a class="online more" style="padding:40px">More...</a>'
	ul.append(li);

}
//添加笔记本操作
function addNotebookAction(){
	var name = $('#input_notebook').val();
	//当未输入笔记本名称时,默认赋值为‘新建笔记本’
	if(name == ''){
		name = '新建笔记本';
	}
	var url = 'notebook/add.do';
	var param = {'userId':getCookie('userId'),'name':name};
	$('.sure').attr('disabled','disabled').html('创建中');
	$.post(url,param,function(result){
		setTimeout(function(){
			if(result.state == SUCCESS){
				$('#can').empty();
				$('.opacity_bg').hide();
				var notebook = result.data;
				model.notebooks.unshift({'id':notebook.id,'name':notebook.name});
				model.updateNotebookView();
			} else {
				$('#can').empty();
				$('.opacity_bg').hide();
				model.updateNotebookView();
				alert('创建笔记本失败啦！');
			}
		}, 1000);
		
	});
}




	