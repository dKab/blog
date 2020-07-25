var form = document.querySelector('.js-form');
form.addEventListener('submit', function(event) {
    var button = document.querySelector('#comment-form-submit');
    button.innerHTML = `<svg class="icon spin"><use xlink:href="#icon-loading"></use></svg> Sending... 
      This might take a few moments. Please wait.`;
    button.setAttribute('disabled', true);
    form.classList.add('disabled');
    var xhr = new XMLHttpRequest();
    var method = form.getAttribute('method');
    var url = form.getAttribute('action');

    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (status === 0 || (200 <= status && status < 400)) {
                MicroModal.show('modal-success');
            } else {
                var unknownError = '¯\_(ツ)_/¯';
                var errorMessage;
                try {
                  var response = JSON.parse(xhr.response);
                  errorMessage = response.message || response.errorCode || unknownError;
                } catch (e) {
                  errorMessage = unknownError;
                }
                document.getElementById('comment-error-code').innerHTML = errorMessage;
                MicroModal.show('modal-error');
            }
            form.classList.remove('disabled');
            form.reset();
            button.removeAttribute('disabled');
            button.innerHTML = 'Submit';
            grecaptcha.reset();
        }
    };

    xhr.send(serialize(form));
    event.preventDefault();
});


function serialize(form) {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
	var i, j, q = [];
	for (i = form.elements.length - 1; i >= 0; i = i - 1) {
		if (form.elements[i].name === "") {
			continue;
		}
		switch (form.elements[i].nodeName) {
		case 'INPUT':
			switch (form.elements[i].type) {
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'email':
			case 'submit':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'checkbox':
			case 'radio':
				if (form.elements[i].checked) {
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				}						
				break;
			case 'file':
				break;
			}
			break;			 
		case 'TEXTAREA':
			q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
			break;
		case 'SELECT':
			switch (form.elements[i].type) {
			case 'select-one':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'select-multiple':
				for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
					if (form.elements[i].options[j].selected) {
						q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch (form.elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			}
			break;
		}
	}
	return q.join("&");
}
 
  document.querySelectorAll('.comment__reply-link').forEach(function(replyButton) {
    replyButton.addEventListener('click', function(e) {
      var button = e.currentTarget;
      var commentId = button.dataset.commentId;
      var parentId = button.dataset.parentId;
      var respondId = button.dataset.respondId;
      var postId = button.dataset.postId;
      var parentUid = button.dataset.parentUid;
      addComment.moveForm(commentId, parentId, respondId, postId, parentUid);
    }, {passive: true});
  });
  
  var addComment = {
    // commId - the id attribute of the comment replied to (e.g., "comment-10")
    // parentId - the numeric index of comment repleid to (e.g., 10)
    // respondId - the string 'respond', I guess
    // postId - the page slug
    moveForm: function( commentId, parentId, respondId, postId, parentUid ) {
      var div, element, style, cssHidden,
      t           = this,                    //t is the addComment object, with functions moveForm and I, and variable respondId
      comm        = t.I( commentId ),                                // whole comment
      respond     = t.I( respondId ),                             // whole new comment form
      cancel      = t.I( 'cancel-comment-reply-link' ),           // whole reply cancel link
      parent      = t.I( 'comment-replying-to' ),                 // hidden element in the comment
      parentuidF  = t.I( 'comment-replying-to-uid' ),             // a hidden element in the comment
      post        = t.I( 'comment-post-slug' ),                   // null
      commentForm = respond.getElementsByTagName( 'form' )[0];    // the <form> part of the comment_form div
  
      if ( ! comm || ! respond || ! cancel || ! parent || ! commentForm ) {
        return;
      }
  
      t.respondId = respondId;
      postId = postId || false;
  
      if ( ! t.I( 'sm-temp-form-div' ) ) {
        div = document.createElement( 'div' );
        div.id = 'sm-temp-form-div';
        div.style.display = 'none';
        respond.parentNode.insertBefore( div, respond ); //create and insert a bookmark div right before comment form
      }
  
      comm.parentNode.insertBefore( respond, comm.nextSibling );  //move the form from the bottom to above the next sibling
      if ( post && postId ) {
        post.value = postId;
      }
      parent.value = parentId;
      parentuidF.value = parentUid;
      cancel.style.display = '';                        //make the cancel link visible
  
      cancel.onclick = function() {
        var t       = addComment,
        temp    = t.I( 'sm-temp-form-div' ),            //temp is the original bookmark
        respond = t.I( t.respondId );                   //respond is the comment form
  
        if ( ! temp || ! respond ) {
          return;
        }
  
        t.I( 'comment-replying-to' ).value = null;      // forget the identity of the reply-to comment
        t.I( 'comment-replying-to-uid' ).value = null;
        temp.parentNode.insertBefore( respond, temp );  //move the comment form to its original location
        temp.parentNode.removeChild( temp );            //remove the bookmark div
        this.style.display = 'none';                    //make the cancel link invisible
        this.onclick = null;                            //retire the onclick handler
        return false;
      };
  
      /*
       * Set initial focus to the first form focusable element.
       */
      for ( var i = 0; i < commentForm.elements.length; i++ ) {
        element = commentForm.elements[i];
        cssHidden = false;

        // Modern browsers.
        if ( 'getComputedStyle' in window ) {
          style = window.getComputedStyle( element );
        // IE 8.
        } else if ( document.documentElement.currentStyle ) {
          style = element.currentStyle;
        }

      /*
       * For display none, do the same thing jQuery does. For visibility,
       * check the element computed style since browsers are already doing
       * the job for us. In fact, the visibility computed style is the actual
       * computed value and already takes into account the element ancestors.
       */
        if ( ( element.offsetWidth <= 0 && element.offsetHeight <= 0 ) || style.visibility === 'hidden' ) {
          cssHidden = true;
        }

        // Skip form elements that are hidden or disabled.
        if ( 'hidden' === element.type || element.disabled || cssHidden ) {
          continue;
        }

        element.focus();
        // Stop after the first focusable element.
        break;
      }
  
      return false;
    },
  
    I: function( id ) {
      return document.getElementById( id );
    }
  };
  