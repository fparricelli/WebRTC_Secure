var button = document.querySelector('#button');

button.onclick = handleClick;



function handleClick(){
	
    $.redirect("./test.html", {param: "boh"}, "POST"); 
	
	
}