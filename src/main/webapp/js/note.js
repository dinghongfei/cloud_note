//显示笔记列表
function showNotesAction(){
	//清空model.noteIndex，以免选择其他笔记本时会默认选择其笔记
	delete model.noteIndex;
	//展示全部笔记模块
	$('#pc_part_2').show();
	$('#pc_part_4').hide();
	//
	$('#notebook .btn_slide_down').hide();
	$(this).find('.btn_slide_down').show();
	//获取点击的笔记本序号
	var index = $(this).data('index');
	model.notebookIndex = index;
	var notebookId = model.notebooks[index].id;
	//清除上一次被选中笔记本的样式
	$(this).siblings().find('a').removeClass('checked');
	//为本次点击的笔记本添加样式
	$(this).find('a').addClass('checked');
	var url = 'note/list.do';
	var param = {'notebookId':notebookId};
	$.getJSON(url,param,function(result){
		if(result.state == SUCCESS){
			var notes = result.data;
			model.updateNoteView(notes);
		}
	});
}
//更新笔记试图
model.updateNoteView = function(notes){
	if(notes){
		this.notes = notes;
	}
	var ul = $('#note').empty();
	var template = '<li class="online">'+
						'<a>'+
							'<i class="fa fa-file-text-o" title="online" rel="tooltip-bottom"></i>'+
							'note.title<button type="button" class="btn btn-default btn-xs btn_position btn_slide_down" style="display:none;">'+
							'<i class="fa fa-chevron-down"></i></button>'+
						'</a>'+
						'<div class="note_menu" tabindex="-1">'+
							'<dl>'+
								'<dt><button type="button" class="btn btn-default btn-xs btn_move" title="移动至..."><i class="fa fa-random"></i></button></dt>'+
								'<dt><button type="button" class="btn btn-default btn-xs btn_share" title="分享"><i class="fa fa-sitemap"></i></button></dt>'+
								'<dt><button type="button" class="btn btn-default btn-xs btn_delete" title="删除"><i class="fa fa-times"></i></button></dt>'+
							'</dl>'+
						'</div>'+
					'</li>';
	//遍历笔记集合，
	for(var i=0;i<this.notes.length;i++){
		var note = this.notes[i];
		var li = $(template.replace('note.title',note.title));
		li.data('index',i);
		if(model.noteIndex==i){
		    li.find('a').addClass('checked');
		}
		ul.append(li);
	}
}
//预览笔记body
function showNoteBodyAction(){
	$('#pc_part_3').hide();
	$('#pc_part_5').show();
	$('#note .btn_slide_down').hide();
	$(this).find('.btn_slide_down').show();
	//获取点击的笔记序号
	var index = $(this).data('index');
	//记录当前笔记的序号
	model.noteIndex = index;
	var noteId = model.notes[index].id;
	$(this).siblings().find('a').removeClass('checked');
	$(this).find('a').addClass('checked');
	var url = 'note/body.do';
	var param = {'noteId':noteId};
	$.getJSON(url,param,function(result){
		if(result.state == SUCCESS){
			var note = result.data;
			model.note = result.data;
			$('#noput_note_title').empty().text(note.title).siblings().remove();
			$('#noput_note_title').parent().append(note.body);
			
		} else{
			alert('哎呦！出错啦！');
		}
	});
}
function showEditNoteView(){
	$('#pc_part_3').show();
	$('#pc_part_5').hide();
	model.updateBodyView(model.note);
	
}

//显示笔记内容
//function showNoteBodyAction(){
//	$('#pc_part_3').show();
//	$('#pc_part_5').hide();
//	//点击笔记后，先把其他笔记的子菜单隐藏，然后显示选中笔记的子菜单
//	$('#note .btn_slide_down').hide();
//	$(this).find('.btn_slide_down').show();
//	//获取点击的笔记序号
//	var index = $(this).data('index');
//	//记录当前笔记的序号
//	model.noteIndex = index;
//	var noteId = model.notes[index].id;
//	$(this).siblings().find('a').removeClass('checked');
//	$(this).find('a').addClass('checked');
//	var url = 'note/body.do';
//	var param = {'noteId':noteId};
//	$.getJSON(url,param,function(result){
//		if(result.state == SUCCESS){
//			model.updateBodyView(result.data);
//		}
//	});
//}
model.updateBodyView = function(note){
	console.log(note);
	this.note = note;
	$('#input_note_title').empty().val(this.note.title);
	um.setContent(this.note.body);
}
//点击保存按钮，保存修改过后的笔记
function saveNoteAction(){
	var m = model.noteIndex;
	var reg = /^\d$/;
	//没选择笔记的情况下，保存笔记不做任何反应
	if(!reg.exec(m)){
		return;
	}
	var note = model.note;
	
	var noteId = model.notes[model.noteIndex].id;
	
	var noteTitle = $('#input_note_title').val();
	var noteBody = um.getContent();
	if(noteTitle==note.title && noteBody==note.body){
		return;
	}
	var url = 'note/save.do';
	var param = {'noteId':noteId,'noteTitle':noteTitle,'noteBody':noteBody};
	$('#save_note').attr('disabled','disabled').html('保存中')
	$.post(url,param,function(result){
		setTimeout(function(){
			$('#save_note').removeAttr('disabled').html('保存笔记');
			if(result.state == SUCCESS){
				//model.note.title = noteTitle;
				//model.note.body = noteBody;
				model.notes[model.noteIndex].title = noteTitle;
				model.updateNoteView();
			}else{
				alert(result.message);
			}
		},800);
	});
}
//创建笔记界面，点击创建按钮后操作
function addNoteAction(){
	var notebookId = model.notebooks[model.notebookIndex].id;
	var userId = getCookie('userId');
	var title = $('#input_note').val();
	if(title == ''){
		title = '新建笔记';
	}
	var url = 'note/add.do';
	var param = {'notebookId':notebookId,'userId':userId,'title':title};
	$('.sure').attr('disabled','disabled').html('创建中');
	$.post(url,param,function(result){
		setTimeout(function(){
			if(result.state == SUCCESS){
				$('#can').empty();
				$('.opacity_bg').hide();
				var note = result.data;
				model.notes.unshift({'id':note.id,'title':note.title});
				model.updateNoteView();
			} else {
				alert(result.message);
			}
		}, 400);
	});
}
//显示笔记子菜单操作
function showNoteMenuAction(){
	$(this).parent().next().toggle();
	return false;
}
//隐藏笔记子菜单操作
function hideNoteMenuAction(){
	$('#note .note_menu').hide();
}
//点击笔记子菜单删除按钮操作
function showDeleteNoteDialogAction(){
	stateType = '1';
	$('#can').load('./alert/alert_delete_note.html',function(){
		$('.opacity_bg').show();
		$('.sure').click(updateNoteStateAction);
	});
}
//点击确定删除按钮
function updateNoteStateAction(){
	var noteId;
	if(stateType == '1'){
		//1 代表删除至回收站
		noteId = model.notes[model.noteIndex].id;
	} else if(stateType == '2'){
		//2 代表第彻底删除
		noteId = model.notesRecycle[model.noteIndexRecycle].id;
	} else {
		noteId = model.notesRecycle[model.noteIndexRecycle].id;
	}
	debugger;
	var url = 'note/state.do';
	var param = {'noteId':noteId,'stateType':stateType};
	$.post(url,param,function(result){
		if(result.state == SUCCESS){
			$('#can').empty();
			$('.opacity_bg').hide();
			if(stateType == '1'){
				model.notes.splice(model.noteIndex,1);
				model.updateNoteView();
			} else{
				model.notesRecycle.splice(model.noteIndexRecycle,1);
				model.updateNoteOnRecycleView();
			}
		} else {
			alert(result.message)
		}
	});
}
/**
 * 2017/2/15
 * 笔记保存方法有点小绕，这里的处理方法是，保存成功后，修改model.note里的title、body，
 * 以及对应model.notes里面的note的title，用于在更新笔记列表时使用。
 * model.updateNoteView()是用于显示笔记列表的，用到了参数model.notes，
 * 这时notes里面的title已经更新，再次遍历时是一个新的啦
 * 
 * 在showNoteBodyAction里面记录当前打开的笔记的序号  model.noteIndex = index ，
 * 用于在修改notes里面对应note的title时获取到note，以及更新视图时控制选中效果
 */
//回收站笔记显示
function showRecycleNotesAction(){
	//这里清除model.noteIndex，是为了deleteNote方法重用，为了判断删除类型（正常，回收站0）
	delete model.noteIndex;
	//对笔记区域隐藏，显示为回收站笔记
	$('#pc_part_2').hide();
	$('#pc_part_4').show();
	var url = 'note/list/recycle.do';
	var param = {'userId':getCookie('userId')};
	$.getJSON(url,param,function(result){
		if(result.state == SUCCESS){
			var notes = result.data;
			model.updateNoteOnRecycleView(notes);
		}else{
			alert("哎呦！出错啦！小主您在重来一遍呗！");
		}
	});
}
model.updateNoteOnRecycleView = function(notes){
	if(notes){
		this.notesRecycle = notes;
	}
	var ul = $('#note_recycle').empty();
	var template = '<li class="disable">'+
						'<a>'+
							'<i class="fa fa-file-text-o" title="online" rel="tooltip-bottom"></i> note.title'+
							'<button type="button" class="btn btn-default btn-xs btn_position btn_delete" title="彻底删除" style="display:none"><i class="fa fa-times"></i></button>'+
							'<button type="button" class="btn btn-default btn-xs btn_position_2 btn_replay" title="还原" style="display:none"><i class="fa fa-reply"></i></button>'+
						'</a>'+
				   '</li>';
	for(var i=0;i<this.notesRecycle.length;i++){
		var note = this.notesRecycle[i];
		var li = $(template.replace('note.title',note.title));
		li.data('index',i);
		ul.append(li);
	}
}
//点击回收站里的笔记，对其内容进行显示
function showNoteBodyOnRecycleAction(){
	//点击笔记后，显示菜单按钮
	$('#note_recycle .btn_delete,.btn_replay').hide();
	$(this).find('.btn_delete,.btn_replay').show();
	//点击笔记后，清楚其他笔记选中效果，当前笔记添加笔记效果
	$(this).siblings().find('a').removeClass('checked');
	$(this).find('a').addClass('checked');
	//对笔记内容进行显示,此功能暂时搁置下
	$('#pc_part_3').hide();
	$('#pc_part_5').show();
	//获取选中
	var index = $(this).data('index');
	model.noteIndexRecycle = index;
	var noteId = model.notesRecycle[index].id;
	$(this).siblings().find('a').removeClass('checked');
	$(this).find('a').addClass('checked');
	var url = 'note/body.do';
	var param = {'noteId':noteId};
	$.getJSON(url,param,function(result){
		if(result.state == SUCCESS){
			var note = result.data;
			$('#noput_note_title').empty().text(note.title).siblings().remove();
			$('#noput_note_title').parent().append(note.body);
		}
	});
}
//点击彻底删除笔记按钮
function showRemoveNoteDialogAction(){
	stateType = '2';
	$('#can').load('./alert/alert_delete_rollback.html',function(){
		$('.opacity_bg').show();
		$('.sure').click(updateNoteStateAction);
	});
}
//回收站点击笔记还原按钮
function showRecoverNoteDialogAction(){
	stateType = '3';
	$('#can').load('./alert/alert_replay.html',function(){
		$('.opacity_bg').show();
		$('.sure').click(updateNoteStateAction);
	});
}

