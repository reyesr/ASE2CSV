// $element: a jquery dom element
// params: an object with the possible properties:
// {
//    overClass: "classname",
//    dropCallback: function(files_array) {}
// }
function installFileDrop($element, params) {
	params = params||{};
	var addOverClass = params.overClass!==undefined?function(){$element.addClass(params.overClass);}:function(){};
	var removeOverClass = params.overClass!==undefined?function() { $element.removeClass(params.overClass);}:function(){};
	
	$element.bind("dragover", function () { addOverClass(); return false;});
	$element.bind("dragleave",function () {  removeOverClass(); return false;}); 
	$element.bind("drop",function(e) {
		removeOverClass();
		e.preventDefault();  
		if (params.dropCallback) {
			params.dropCallback(e.originalEvent.dataTransfer.files);
		}
	});
	
};