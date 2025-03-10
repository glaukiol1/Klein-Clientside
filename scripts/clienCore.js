/*
	Clien viewer, V0.5
	
	Changelog: 
	
		V0.3: completely removed Mithril
		V0.4: Added support for nested lists
		v0.5: Added next/back buttons
			- 0.5.1 fix for header not showing special characters properly
			- 0.5.2 Added highlight to the active button
*/

/*
	each page gets it own button.  However, the buttons are stored in a
	separate part of the view, so I chose to put them into their own 
	variable here
*/
var pageButtons = {
	buttons: []
}

/*
	
*/
var answers=[];

/*
	There must be a single "How did I do" button, and that must be global
	to Clien.  This way, once you click it, the entire page is searched.
	It cannot be question-specific, otherwise it will not properly search
	every answer and change the DOM.
*/
function howDidIDo()
{
	for(var i = 0; i < answers.length; i++)
	{
		var yesBx = document.getElementById("AnswerCheck"+answers[i].ID);
		if(answers[i].checkAnswer())
		{

			yesBx.innerHTML = " \u2705";
		}
		else
		{
			yesBx.innerHTML = " \u274C";
		}
	}
	
	
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

/*
	The onclick for the page select buttons
*/
var curPage = 0;
var totPages = 0;
function changePage(elem){
	//force a deep copy
	//data.currentPage = JSON.parse(JSON.stringify(data.pages[elem.id]))
	var pageArray = document.getElementsByClassName("PAGE");
	for(var i = 0; i < pageArray.length; i++)
	{
		var id = pageArray[i].getAttribute("id").replace("pg","");
		if(Number(id)===elem.id)
		{
			pageArray[i].style.display = 'block';
			curPage = id; //This is for the next/back buttons
		}			
		else
			pageArray[i].style.display="none"
	}
	
	//Now scroll to the top
	document.body.scrollTop = 0; //Safari compatibility
	document.documentElement.scrollTop = 0; //Everything else
		
	//finally highlight the button whose page it is
	var btnArray = document.getElementById('selectRow').getElementsByTagName("BUTTON");
	for(var i = 0; i < btnArray.length; i++)
	{
		//This is slightly sketchy, as it leaves an empty "class" attribute but it works
		btnArray[i].classList.remove("activeButton");
		if(btnArray[i].getAttribute("id") === "pageBTN"+elem.id)
		{
			btnArray[i].classList.remove("inactiveButton");
			btnArray[i].classList.add("activeButton");
		}
		else
		{
			btnArray[i].classList.add("inactiveButton");
		}
	}
}

function nextPage()
{
	if(curPage < totPages-1)
	{
		curPage++;
		changePage({id:curPage});
	}
}
function backPage()
{
	if(curPage > 0)
	{
		curPage--;
		changePage({id:curPage});
	}
}

/*
	makes and returns a new button
*/
function makeNewPageButton(btn)
{
	var newBtn = document.createElement("BUTTON");
	newBtn.onclick = function(){changePage(btn)};
	newBtn.setAttribute("id","pageBTN" + btn.id);
	newBtn.innerHTML = btn.content;
	return newBtn;
}

/*
	This mounts the whole thing.  It gets called exactly once, after
	all of the JSON is parsed.  It sets up "how did I do", as well as
	displays all pages and buttons
*/
function makeNewPage(){
	var checkRoot = document.getElementById('HDID');
	var contentRoot = document.getElementById('contentPlace');
	var selectRoot = document.getElementById('selectRow')
	
	//first add how did I do button if there is any answerables
	if(answers.length>0)
	{
		var hdidBtn = document.createElement("BUTTON");
		hdidBtn.onclick = howDidIDo;
		hdidBtn.setAttribute("id","HDID");
		hdidBtn.innerHTML = "How did I do?";
		checkRoot.appendChild(hdidBtn);
	}
	
	//now mount the buttons
	for(var i = 0; i < pageButtons.buttons.length; i++)
	{
		selectRoot.appendChild(makeNewPageButton(pageButtons.buttons[i]));
	}
	
	//now we need to add the next/back buttons
	var nextBtn = document.createElement("BUTTON");
	nextBtn.onclick = nextPage;
	nextBtn.setAttribute("id","NEXT");
	nextBtn.innerHTML = "Next >>";
	selectRoot.appendChild(nextBtn);
	
	var backBtn = document.createElement("BUTTON");
	backBtn.onclick = backPage;
	backBtn.setAttribute("id","BACK");
	backBtn.innerHTML = "<< Previous";
	selectRoot.appendChild(backBtn);
		
	//finally make the first page show up
	changePage({id:0});

}

function makeNewHTML(htmlNode)
{
	var newHtml = document.createElement(htmlNode.tag.toUpperCase());
	newHtml.setAttribute('id',htmlNode.options.id);
	if(htmlNode.options.class)
		newHtml.setAttribute("class",htmlNode.options.class);
	if(htmlNode.options.href) //this means it is a link
	{
		newHtml.setAttribute("href",htmlNode.options.href);
		newHtml.setAttribute("target","_blank"); //new tab
	}
	newHtml.innerHTML = htmlNode.content;
	return newHtml;
}

//makes videos and images
function makeNewMedia(mediaNode,type)
{
	var newMedia = document.createElement(type);
	newMedia.setAttribute("width",mediaNode.width);
	if(type==="VIDEO")
		newMedia.setAttribute("controls","controls");
	newMedia.setAttribute("src",mediaNode.src);
	newMedia.setAttribute("id",mediaNode.id);
	return newMedia;
}

/*
	This function parses the JSON file and creates the book, finally
	calling on a function to mount it.
*/
function parseBookFromJSON(inputBook)
{	
	var contentRoot = document.getElementById('contentPlace');
	totPages = inputBook.pages.length; //used so that we can do next/back - you can't move to the next page beyond the last one
	for (var i = 0; i < inputBook.pages.length; i++)
	{
		
		//push a new button for the new page.  This gets rendered in makeNewPage
		pageButtons.buttons.push(
		{
			type    : 'button[id="'+i+'"]',
			content : inputBook.pages[i].name,
			id : i,
			opts    : {onclick: function(){changePage(this)}}
		}
		)
		var newPage = document.createElement("DIV");
		var pageStack = [];
		newPage.setAttribute("class","PAGE");
		newPage.setAttribute("id","pg"+i);
		contentRoot.appendChild(newPage);
		//add content to the page
		for(var j = 0; j < inputBook.pages[i].components.length;j++)
		{
			var cmp = inputBook.pages[i].components[j];
			if(cmp.type==="HTML")
			{
				newPage.appendChild(makeNewHTML(cmp));
			}
			else if(cmp.type == "CHECKPOINT")
			{
				var checkDiv = {tag:"div",options:{id:"check"+j+"Page"+i,class:"checkpoint"},content:""};
				var curPage = makeNewHTML(checkDiv);
				newPage.appendChild(curPage);
				pageStack.push(newPage);
				newPage = curPage;
			}
			else if(cmp.type == "ENDCHECK")
			{
				cmp.options = {class:"endcheckpoint",id:" "}
				cmp.tag="h2";
				cmp.content="   ";
				newPage.appendChild(makeNewHTML(cmp))
				
				newPage = pageStack.pop()//JSON.parse(JSON.stringify(pageStack.pop()));
			}
			else if(cmp.type == "BLOCKCODE")
			{
				var codeDiv = {tag:"div",options:{id:"blockCode"+j+"Page"+i,class:"blockCode"},content:""};
				var curPage = makeNewHTML(codeDiv);
				newPage.appendChild(curPage);
				pageStack.push(newPage);
				newPage = curPage;
			}
			else if(cmp.type == "ENDBLOCKCODE")
			{
				cmp.options = {class:"endBlockCode",id:" "}
				cmp.tag="p";
				cmp.content="   ";
				newPage.appendChild(makeNewHTML(cmp))
				
				newPage = pageStack.pop();
			}
			else if(cmp.type == "UL")
			{
				var listDiv = {tag:"ul",options:{id:"list"+j+"Page"+i},content:""};
				var curPage = makeNewHTML(listDiv);
				newPage.appendChild(curPage);
				pageStack.push(newPage);
				newPage = curPage;
			}
			else if(cmp.type == "OL")
			{
				var listDiv = {tag:"ol",options:{id:"list"+j+"Page"+i},content:""};
				var curPage = makeNewHTML(listDiv);
				newPage.appendChild(curPage);
				pageStack.push(newPage);
				newPage = curPage;
			}
			else if(cmp.type == "ENDLIST")
			{
				newPage = pageStack.pop()//JSON.parse(JSON.stringify(pageStack.pop()));
			}
			else if(cmp.type == "LINK")
			{
				var linkDiv = {tag:"a",options:{id:cmp.id,href:cmp.addr,class:"link"},content:cmp.text};
				newPage.appendChild(makeNewHTML(linkDiv));
			}
			else if(cmp.type==="answerBox")
			{
				var newAns = new answerBox(cmp.dataString,cmp.id);
				answers.push(newAns);
				newAns.addContent(newPage);
			}
			else if(cmp.type==="video")
			{
				newPage.appendChild(makeNewMedia(cmp,"VIDEO"));
			}
			else if(cmp.type==="img")
			{
				newPage.appendChild(makeNewMedia(cmp,"IMG"));
			}
		}
	}
	
	//mount the book's title, which should never change throughout an assignment
	var headerRoot = document.getElementById("header");
	var headDiv = {tag:"span",options:{id:cmp.id},content:inputBook.bookName};
	headerRoot.appendChild(makeNewHTML(headDiv));

	//finally, create the first page
	makeNewPage();
}

/*
	What follows is required for MathJax.  Basically, once we change
	a page, MathJax has to re-render the DOM.  It can't do that until the
	DOM is done rendering, and we must explicitly tell it to re-render.
	
	So, we create a MutationObserver (Javascript standard object that looks
	for mutations in a particular element), and then call MathJax's 
	typesetting functions
*/
function mutate()
{
	//disconnect, or else we will infinitely change/mutate
	observer.disconnect();
	
	//at first, MathJax may not exist (this is only for the first page load)
	if(MathJax){
		//re-typeset
		MathJax.typesetPromise();
	}
	//We need to ensure that the data displayed in the answer boxes is not 
	//  stale after the DOM reloads
	for(var i = 0; i < answers.length; i++)
	{
		if(document.getElementById(answers[i].ID + "_answerBox"))
		{
			document.getElementById(answers[i].ID + "_answerBox").value = answers[i].AnsString;
		}
	}
	//reconnect so that we can see mutations again
	observer.observe(targetNode,config);
}

//mutation observer for Mathjax
const observer = new MutationObserver(mutate);
// Select the node that will be observed for mutations
const targetNode = document.getElementById("contentPlace");

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };
observer.observe(targetNode,config);
observer.observe(targetNode,config);