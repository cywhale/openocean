//Make the DIV element draggagle:
//https://www.w3schools.com/howto/howto_js_draggable.asp
export default async function draggable_element(props) {
  const {dom, dragArea} = props;

  function dragElement(elem, dragArea) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elem.style.top = (elem.offsetTop - pos2) + "px";
      elem.style.left = (elem.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }

    if (elem.querySelector(dragArea)) {
      /* if present, the header is where you move the DIV from:*/
      const dragx = elem.querySelector(dragArea);
      dragx.onmousedown = dragMouseDown;
    } else { /* otherwise, move the DIV from anywhere inside the DIV:*/
      elem.onmousedown = dragMouseDown;
    }
  }

  const elems = document.querySelectorAll(dom);
  await elems.forEach(async (elem) => {
    await dragElement(elem, dragArea);
  });
}
